# Hugo-Lyra

[![Tests](https://github.com/paolomainardi/hugo-lyra/actions/workflows/tests.yml/badge.svg)](https://github.com/paolomainardi/hugo-lyra/actions/workflows/tests.yml)

[Hugo][1] is a fantastic static site generator and, like most of them, is not natively capable of implementing a dynamic search engine like we are used to using on more traditional server-side platforms, with more or less advanced query capabilities.

This project aims to precisely solve this problem by integrating the uber-cool [Lyra search engine][2] with Hugo.

It works by parsing the `content/\*\*/\*.md` files into raw text and using it to generate a Lyra index,
which will become a static asset you can publish alongside the other files.

> Currently, this project solves just the server-side part; you must implement the client-side code to consume the Lyra index for the search page; you can find some examples [here][3] (lunr-based).

Anyway, it's in the todo-list and the client code will be part of this project soon.

## Installation

`npm i paolomainardi/hugo-lyra`

`yarn add paolomainardi/hugo-lyra`

## Usage

**Hugo-Lyra** is simple to use.

Once installed, you can integrate it into your `package.json` in the scripts section like this:

```json

"scripts": {
  "index": "hugo-lyra"
}
...

```

By default, **Hugo-Lyra** will read the `content` directory of you and output the Lyra index to `public/hugo-lyra-english.msp`.

You can tweak some configurations (like input, output, language, format, ecc.) by passing
input arguments to the cli; you can see all the options by running:

`npx hugo-lyra -h`

Of course you can regenerate the index programmatically just by running:

`npx hugo-lyra`

> TIP: If you run it with `DEBUG=hugo-lyra npx hugo lyra`, you can make profit
> of extra debugging logs.

## How to use hugo-lyra api

Hugo-Lyra is packaged with ES modules, CommonJS.

In most cases, import or require `paolomainardi/hugo-lyra`, and your environment will
choose the most appropriate build.

### Typescript

```typescript
import { cwd } from "process";
import { generateIndex } from "hugo-lyra";
import { LyraOptions } from "hugo-lyra/dist/esm/types";

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
[3]: https://gohugo.io/tools/search/