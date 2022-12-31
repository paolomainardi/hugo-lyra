import striptags from "striptags";
import { marked } from "marked";
import { unescape } from "lodash";

/* c8 ignore start */
const block = (text: string) => text + "\n\n";
const line = (text: string) => text + "\n";
const inline = (text: string) => text;
const newline = () => "\n";
const empty = () => "";

const TxtRenderer: marked.Renderer = {
  // Block elements
  blockquote: block,
  html: empty,
  heading: block,
  hr: newline,
  list: text => block(text.trim()),
  listitem: line,
  checkbox: empty,
  paragraph: block,
  table: (header, body) => line(header + body),
  tablerow: text => line(text.trim()),
  tablecell: text => text + " ",

  // Inline elements
  strong: inline,
  em: inline,
  br: newline,
  del: inline,
  link: (_0, _1, text) => text,
  image: (_0, _1, text) => text,
  text: inline,

  // Empty elements.
  code: empty,
  codespan: empty,

  // etc.
  options: {},
};
/* c8 ignore stop */

/**
 * Convert markdown to raw text, it deletes html tags as well.
 *
 * @param markdown - The markdown text to be converted
 * @returns The raw text stripped of markdown and html tags.
 *
 * @todo Make the renderer configurable, for example to do not strip out code.
 * @beta
 */
export function plainText(markdown: string): string {
  if (!markdown) {
    return "";
  }
  const md = markdown.replace("/^[\u200B\u200C\u200D\u200E\u200F\uFEFF]/", "");
  const untagged = striptags(md);
  const unmarked = marked(untagged, { renderer: TxtRenderer });
  const text = unescape(unmarked);
  const clean = text
    .replace(/{{<.*>}}/g, "") // remove shortcodes.
    .replace(/\n/g, " ") // remove line breaks.
    .replace(/ {2,}/g, " ") // remove empty spaces.
    .trim();
  return clean;
}
