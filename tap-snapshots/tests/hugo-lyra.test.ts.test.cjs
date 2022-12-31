/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`tests/hugo-lyra.test.ts TAP Test create index no results on empty dir > empty 1`] = `
Object {
  "docs": Array [],
  "foundDocuments": 0,
  "indexed": 0,
  "indexFilePath": "/tmp/hugo-lyra-english.msp",
}
`

exports[`tests/hugo-lyra.test.ts TAP Test create index should skip draft and empty pages and save the index in the binary format > no-draft-empty 1`] = `
Object {
  "docs": Array [
    Object {
      "body": "Hello world Lorem ipsum deep dive into procrastination",
      "meta": Null Object {
        "categories": "category",
        "date": "2022-09-03",
        "draft": "false",
        "keywords": "first,second",
        "slug": "hello-world",
        "tags": "personal,procrastination",
        "title": "Hello world, and deep dive into procrastination",
      },
      "title": "Hello world, and deep dive into procrastination",
      "uri": "/content/hello-world",
    },
  ],
  "foundDocuments": 3,
  "indexed": 1,
  "indexFilePath": "/tmp/hugo-lyra-english.msp",
}
`

exports[`tests/hugo-lyra.test.ts TAP Test create index should skip draft and empty pages and save the index in the binary format even if passing undefined variables > msp 1`] = `
Object {
  "docs": Array [
    Object {
      "body": "Hello world Lorem ipsum deep dive into procrastination",
      "meta": Null Object {
        "categories": "category",
        "date": "2022-09-03",
        "draft": "false",
        "keywords": "first,second",
        "slug": "hello-world",
        "tags": "personal,procrastination",
        "title": "Hello world, and deep dive into procrastination",
      },
      "title": "Hello world, and deep dive into procrastination",
      "uri": "/content/hello-world",
    },
  ],
  "foundDocuments": 3,
  "indexed": 1,
  "indexFilePath": "/tmp/hugo-lyra-english.msp",
}
`

exports[`tests/hugo-lyra.test.ts TAP Test create index should skip draft and empty pages and save the index in the json format > json 1`] = `
Object {
  "docs": Array [
    Object {
      "body": "Hello world Lorem ipsum deep dive into procrastination",
      "meta": Null Object {
        "categories": "category",
        "date": "2022-09-03",
        "draft": "false",
        "keywords": "first,second",
        "slug": "hello-world",
        "tags": "personal,procrastination",
        "title": "Hello world, and deep dive into procrastination",
      },
      "title": "Hello world, and deep dive into procrastination",
      "uri": "/content/hello-world",
    },
  ],
  "foundDocuments": 3,
  "indexed": 1,
  "indexFilePath": "/tmp/hugo-lyra-english.json",
}
`
