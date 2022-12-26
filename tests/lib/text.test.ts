import t from "tap";
import { plainText } from "../../src/lib/text";
import { readFileSync } from "fs";

t.test("Test markdown parser", t => {
  t.plan(5);

  t.test("markdown and html must be removed", t => {
    t.plan(1);

    const md = `
# Hello world <pre>post</pre> \`<code>1234</code>\`
## This an h2
### This is an h3`;
    const expected = `
Hello world post
This an h2
This is an h3`
      .trim()
      .replace(/\n/g, " "); // replace new line with space.
    const found = plainText(md);
    t.same(expected, found);
  });

  t.test("html must be stripped", t => {
    t.plan(1);
    const found = plainText(`
<h1>Heading h1</h1>
<p>Hello world</p>`);
    const expected = "Heading h1 Hello world";
    t.same(expected, found);
  });

  t.test("code block must be plain-texted", t => {
    t.plan(1);
    const md = readFileSync("tests/fixtures/post.md").toString();
    const expected = readFileSync("tests/fixtures/post.txt").toString();
    const found = plainText(md);
    t.same(expected, found);
  });

  t.test("empty markdown is empty response", t => {
    t.plan(1);
    const md = "";
    const expected = "";
    const found = plainText(md);
    t.same(expected, found);
  });

  t.test("shortcodes must be removed", t => {
    t.plan(1);
    const md =
      '{{< figure src="/images/posts/3-docker/docker-mac-diagram.excalidraw-black.webp" caption="Docker bind mount diagram" >}}';
    const expected = "";
    const found = plainText(md);
    t.same(expected, found);
  });
});
