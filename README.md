# Hugo-Lyra

\[!\[Tests\](https://github.com/paolomainardi/hugo-lyra/actions/workflows/tests.yml/badge.svg)\](https://github.com/paolomainardi/hugo-lyra/actions/workflows/tests.yml)

[Hugo][1] is a fantastic static site generator and, like most of them, is not natively capable of implementing a dynamic search engine like we are used to using on more traditional server-side platforms, with more or less advanced query capabilities.

This project aims to solve this problem by integrating the [Lyra search engine][2] with Hugo.

It works by parsing the `content/\*\*/\*.md` files into raw text and using it to generate a Lyra index, which will become a static asset you can publish alongside the other files of Hugo public dist.

This project also offers a client-side javascript library to easily consume the index from your Hugo website; you can see it in [action on my personal blog here][3] and [here][4] for the implementation. You can jump to the [client section](#client-side) for more details.

The parser can parse just Markdown files, and standard front-matter elements, arrays like tags, and categories are imploded and space-separated.

**Schema definition**:

```javascript
const hugoDb = create({
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
  defaultLanguage: "english",
});
```

## Client side

You need to import the library from the CDN:

```html

<script src=https://unpkg.com/hugo-lyra@latest/dist/browser/hugo-lyra.js></script>

```

Or better using [Hugo Pipes][5] on your [base template][6]:

```javascript
{{ $script := resources.GetRemote https://unpkg.com/hugo-lyra@latest/dist/browser/hugo-lyra.js | minify | fingerprint }}
<script src="{{ $script.RelPermalink }}" integrity="{{ $script.Data.Integrity }}"></script>
```

Once instantiated, you'll find a new global object on the `window.HugoLyra` global object you can use to implement your search engine.

How you'll use it it's up to you to better fit your needs; you can find below a straightforward raw javascript implementation you can use as a starting point:

```javascript
(async () => {
  try {
    const params = new URLSearchParams(window.location.search);
    const query = params.get("q");
    if (query) {
      const db = await HugoLyra.fetchDb(`/hugo-lyra-english.json`);
      const res = await HugoLyra.search(db, { term: query, properties: "*" });
      document.getElementById("search-input").setAttribute("value", res.options.term);
      let resultList = "";
      const searchResults = document.getElementById("results");
      if (res?.search?.count) {
        for (const hit of res.search.hits) {
          const doc = hit.document;
          resultList += "<li>";
          resultList += '<span class="date">' + doc.meta.date + "</span>";
          resultList += '<a class="title" href="' + doc.uri + '">' + doc.title + "</a>";
          resultList += "</li>";
        }
      }
      searchResults.innerHTML = resultList.length ? resultList : "No results found";
    }
  } catch (e) {
    console.error(e);
  }
})();
```

This code is part of my blog; you can dig it more [here][7].

## Server side

`npm i paolomainardi/hugo-lyra`

`yarn add paolomainardi/hugo-lyra`

## Usage

**Hugo-Lyra** is simple to use.

Once installed, you can integrate it into your `package.json` in the scripts section like this:

```json

"scripts": {
  "index": "hugo-lyra"
}

```

By default, **Hugo-Lyra** will read the `content` directory of you and output the Lyra index to `public/hugo-lyra-english.msp`.

You can tweak some configurations (like input, output, language, format, ecc.) by passing input arguments to the cli; you can see all the options by running:

`npx hugo-lyra -h`

Of course, you can regenerate the index programmatically just by running:

`npx hugo-lyra`

\> TIP: If you run it with `DEBUG=hugo-lyra npx hugo lyra`, you can make profit

\> of extra debugging logs.

For instance, assuming we want to:

- Generate the index in JSON format

- Save it on `dist/search`

- Parse `content/posts`

The command will be: `npx --yes hugo-lyra --content content/posts --indexFormat json --indexFilePath output/search`

> TIP: If you run it with `DEBUG=hugo-lyra npx hugo lyra`, you can make profit

## How to use hugo-lyra API

Hugo-Lyra is packaged with ES modules, CommonJS.

In most cases, import or require `paolomainardi/hugo-lyra`, and your environment will choose the most appropriate build.

Sometimes, you may need to import or require specific files (such as types). The following builds are included in the Lyra package:

You can use it from Javascript/Typescript:

### Typescript

```javascript
import { cwd } from "process";
import { generateIndex } from "hugo-lyra";
import { LyraOptions } from "hugo\-lyra/dist/esm/types";

(async () => {
  const res = await generateIndex("./content", <LyraOptions>{
  indexFilePath: cwd(),
});

console.log(res);

})();
```

### Javascript

```javascript
const { cwd } = require("process");
const { generateIndex } = require("hugo-lyra");

(async () => {
  const res = await generateIndex("./content", {
    indexFilePath: process.cwd(),
  });
  console.log(res);
})();
```

[1]: https://gohugo.io/
[2]: https://github.com/LyraSearch/lyra
[3]: https://www.paolomainardi.com/posts/
[4]: https://github.com/paolomainardi/paolomainardi.com/blob/main/src/assets/js/search.js
[5]: https://gohugo.io/hugo-pipes/introduction/
[6]: https://gohugo.io/templates/base/#define-the-base-template
[7]: https://github.com/paolomainardi/paolomainardi.com/blob/main/src/assets/js/search.js
