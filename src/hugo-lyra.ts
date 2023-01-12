import fastGlob from "fast-glob";
import matter from "gray-matter";
import toml from "toml";
import { readFileSync } from "fs";
import { debug } from "debug";
import { plainText } from "./lib/text";
import { create, insertBatch } from "@lyrasearch/lyra";
import { PersistenceFormat, persistToFile } from "@lyrasearch/plugin-data-persistence";
import { Language } from "@lyrasearch/lyra/dist/tokenizer";
import { HugoFrontMatter, HugoPost, IndexResult, LyraDoc, LyraOptions } from "./types";
import path, { dirname } from "path";
import { filterObject } from "./lib/utils";

const d = debug("hugo-lyra");
const HUGO_FRONT_MATTER_DELIMITER = "+++";

/**
 *
 * Calculate the uri as hugo does.
 * Adapated from here: https://github.com/dgrigg/hugo-lunr/blob/master/lib/index.js#L134
 *
 * @param basedir - Hugo content base dir.
 * @param filePath - Content file path.
 * @param frontMatter - Content parsed hugo front matter.
 * @returns The calculated uri string.
 */
export function calculateUri(basedir: string, filePath: string, frontMatter: HugoFrontMatter) {
  let uri = "/" + filePath.substring(0, filePath.lastIndexOf("."));
  uri = uri.replace(dirname(basedir) + "/", "");
  uri = uri.replace(/^\/content/, "");
  if (uri.endsWith("index")) {
    uri = uri.substring(0, uri.lastIndexOf("index"));
  }
  if (frontMatter.slug != undefined) {
    uri = path.dirname(uri) !== "/" ? path.dirname(uri) : "";
    uri += `/${frontMatter.slug}`;
  }
  if (frontMatter.url != undefined) {
    uri = `/${frontMatter.url}`;
  }

  // return without any trailing slash.
  return uri.replace(/\/$/, "");
}

/**
 * Find all the markdown files (posts) inside a basedir.
 *
 * @param baseDir - Hugo contents basedir.
 * @returns An array of HugoPost.
 */
async function getPosts(baseDir: string): Promise<HugoPost[]> {
  const files = await fastGlob(baseDir + "/**/*.md");
  const posts: HugoPost[] = [];
  d(`Posts found on ${baseDir}: ${files.length}`);
  for (const file of files) {
    const md = readFileSync(file).toString();
    const { content, data } = matter(md, {
      delimiters: HUGO_FRONT_MATTER_DELIMITER,
      language: "toml",
      engines: {
        toml: toml.parse.bind(toml),
      },
    });
    if (data.tags?.length) {
      data.tags = data.tags.join(" ");
    }
    if (data.categories?.length) {
      data.categories = data.categories.join(" ");
    }
    if (data.keywords?.length) {
      data.keywords = data.keywords.join(" ");
    }
    const post: HugoPost = {
      title: data.title,
      body: content,
      uri: calculateUri(baseDir, file, <HugoFrontMatter>data),
      filePath: file,
      frontMatter: <HugoFrontMatter>data,
      isDraft: data.draft == "true",
      isEmpty: !content,
    };
    posts.push(post);
  }
  return posts;
}

/**
 * Generate the lyra index with the parsed hugo contents.
 *
 * @param baseDir - Hugo content directory
 * @param options - Lyra options to configure file path, default language and index format.
 * @returns An object (IndexResult) containing the index path and some other infos.
 */
export async function generateIndex(baseDir: string, options: LyraOptions = {}): Promise<IndexResult> {
  const defaultOpts: LyraOptions = {
    indexFilePath: "public",
    indexDefaultLang: "english",
    indexFormat: "binary",
  };

  // Remove all undefined, empty and not strings eleemn
  const filterOptions = filterObject(options, ([_, val]) => {
    _;
    return typeof val === "string" && !!val;
  });
  const opts = { ...defaultOpts, ...filterOptions };
  const hugoDb = await create({
    schema: {
      title: "string",
      body: "string",
      uri: "string",
      meta: {
        date: "string",
        description: "string",
        tags: "string",
        categories: "string",
        keywords: "string",
        summary: "string",
      },
    },
    defaultLanguage: defaultOpts.indexDefaultLang as Language,
  });
  const docs = [];
  const posts = await getPosts(baseDir);
  for (const post of posts) {
    if (post.isDraft || post.isEmpty) {
      d("Skip empty or draft:", post);
      continue;
    }
    const doc = <LyraDoc>{
      title: post.frontMatter.title,
      body: plainText(post.body),
      uri: post.uri,
      meta: post.frontMatter,
    };
    d(`Inserting document:`, doc);
    docs.push(doc);
  }
  // Insert documents on Lyra.
  await insertBatch(hugoDb, docs);

  // Save documents.
  const file = await persistToFile(
    hugoDb,
    opts.indexFormat as PersistenceFormat,
    `${opts.indexFilePath}/hugo-lyra-${opts.indexDefaultLang}.${
      opts.indexFormat == "binary" ? "msp" : opts.indexFormat
    }`,
  );
  return <IndexResult>{
    indexFilePath: file,
    foundDocuments: posts.length,
    indexed: docs.length,
    docs: docs,
  };
}
