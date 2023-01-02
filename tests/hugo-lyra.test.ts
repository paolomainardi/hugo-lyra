import { calculateUri, generateIndex } from "../src/hugo-lyra";
import t from "tap";
import { restoreFromFile } from "@lyrasearch/plugin-data-persistence";
import { search } from "@lyrasearch/lyra";
import { rmSync } from "fs";
import { HugoFrontMatter, LyraOptions } from "../src/types";

t.test("Test create index", t => {
  t.plan(6);

  t.test("should raise an exception if cannot write the index", async t => {
    t.plan(1);
    const options: LyraOptions = {
      indexFilePath: "/not-existing-dir",
    };
    t.rejects(
      generateIndex("./tests/fixtures/posts/content", options),
      "Error: ENOENT: no such file or directory, open '/not-existing-dir/hugo-lyra-english.msp'",
    );
  });

  t.test(
    "should skip draft and empty pages and save the index in the binary format even if passing undefined variables",
    async t => {
      t.plan(3);
      const options: LyraOptions = {
        indexFilePath: "/tmp",
        indexFormat: undefined,
        indexDefaultLang: "",
      };
      const res = await generateIndex("./tests/fixtures/posts/content", options);
      t.matchSnapshot(res, "msp");
      t.match(res?.indexFilePath, "msp");
      t.match(res?.indexFilePath, "english");
      rmSync(res.indexFilePath);
    },
  );

  t.test("should skip draft and empty pages and save the index in the json format", async t => {
    t.plan(2);
    const options: LyraOptions = {
      indexFilePath: "/tmp",
      indexFormat: "json",
    };
    const res = await generateIndex("./tests/fixtures/posts/content", options);
    t.matchSnapshot(res, "json");
    t.match(res?.indexFilePath, "json");
    rmSync(res.indexFilePath);
  });

  t.test("should skip draft and empty pages and save the index in the binary format", async t => {
    t.plan(1);
    const options: LyraOptions = {
      indexFilePath: "/tmp",
    };
    const res = await generateIndex("./tests/fixtures/posts/content", options);
    t.matchSnapshot(res, "no-draft-empty");
    rmSync(res.indexFilePath);
  });

  t.test("should restore the binary format", async t => {
    t.plan(3);
    const options: LyraOptions = {
      indexFilePath: "/tmp",
    };
    const res = await generateIndex("./tests/fixtures/posts/content", options);
    const restore = restoreFromFile("binary", res?.indexFilePath);
    const qp1 = search(restore, {
      term: "procrastination",
      properties: ["meta.tags"],
    });
    t.ok(qp1);
    t.same(qp1.count, 1);
    t.type(res?.indexFilePath, "string");
    rmSync(res.indexFilePath);
  });

  t.test("no results on empty dir", async t => {
    t.plan(1);
    const options: LyraOptions = {
      indexFilePath: "/tmp",
    };
    const res = await generateIndex("./tests/fixtures/posts/empty", options);
    t.matchSnapshot(res, "empty");
    rmSync(res.indexFilePath);
  });
});

t.test("Calculate uri on index.md", t => {
  t.plan(5);
  t.test("is the directory name when no slug or url is defined", t => {
    t.plan(1);
    const baseDir = "./tests/fixtures/posts/content";
    const filePath = "./tests/fixtures/posts/content/post-3-empty/index.md";
    const frontMatters = {};
    const res = calculateUri(baseDir, filePath, <HugoFrontMatter>frontMatters);
    t.same("/post-3-empty", res);
  });

  t.test(
    "is the directory name when no slug or url is defined and the directory is named content and file is index.md",
    t => {
      t.plan(1);
      const baseDir = "./tests/fixtures/posts/content";
      const filePath = "./tests/fixtures/posts/content/content/index.md";
      const frontMatters = {};
      const res = calculateUri(baseDir, filePath, <HugoFrontMatter>frontMatters);
      t.same("/content", res);
    },
  );

  t.test(
    "is the directoryname/post when no slug or url is defined and the directory is named content and file is post.md",
    t => {
      t.plan(1);
      const baseDir = "./tests/fixtures/posts/content";
      const filePath = "./tests/fixtures/posts/content/content/post.md";
      const frontMatters = {};
      const res = calculateUri(baseDir, filePath, <HugoFrontMatter>frontMatters);
      t.same("/content/post", res);
    },
  );

  t.test("is slug name when url is not defined", t => {
    t.plan(1);
    const baseDir = "./tests/fixtures/posts/content";
    const filePath = "./tests/fixtures/posts/content/post-3-empty/index.md";
    const frontMatters = {
      slug: "hello-world",
    };
    const res = calculateUri(baseDir, filePath, <HugoFrontMatter>frontMatters);
    t.same("/hello-world", res);
  });

  t.test("is url name when url and slug are both defined", t => {
    t.plan(1);
    const baseDir = "./tests/fixtures/posts/content";
    const filePath = "./tests/fixtures/posts/content/post-3-empty/index.md";
    const frontMatters = {
      slug: "hello-world",
      url: "foobar",
    };
    const res = calculateUri(baseDir, filePath, <HugoFrontMatter>frontMatters);
    t.same("/foobar", res);
  });
});

t.test("Calculate uri on post.md", t => {
  t.plan(3);
  t.test("is filename when url and slug are not defined", t => {
    t.plan(1);

    const baseDir = "./tests/fixtures/posts/content";
    const filePath = "./tests/fixtures/posts/content/post-3-empty/post.md";
    const frontMatters = {};
    const res = calculateUri(baseDir, filePath, <HugoFrontMatter>frontMatters);
    t.same("/post-3-empty/post", res);
  });

  t.test("is directory/slug when slug is defined and url is not defined", t => {
    t.plan(1);

    const baseDir = "./tests/fixtures/posts/content";
    const filePath = "./tests/fixtures/posts/content/post-3-empty/post.md";
    const frontMatters = {
      slug: "hello-world",
    };
    const res = calculateUri(baseDir, filePath, <HugoFrontMatter>frontMatters);
    t.same("/post-3-empty/hello-world", res);
  });

  t.test("is url when url is defined", t => {
    t.plan(1);

    const baseDir = "./tests/fixtures/posts/content";
    const filePath = "./tests/fixtures/posts/content/post-3-empty/post.md";
    const frontMatters = {
      slug: "hello-world",
      url: "foobar",
    };
    const res = calculateUri(baseDir, filePath, <HugoFrontMatter>frontMatters);
    t.same("/foobar", res);
  });
});
