import t from "tap";
import CacheMock from "browser-cache-mock";
const cacheMock = new CacheMock();

/* eslint-disable */
let fetchMockFunction: any;
const fetch: any = () => {
  let emptyFetchResponse: Response = new Response();
  if (fetchMockFunction) {
    return fetchMockFunction();
  }
  return emptyFetchResponse;
};
global.fetch = fetch;

// Mock cache object.
global.caches = cacheMock as any;
global.caches.open = async () => cacheMock;

/* eslint-enable */

import { HugoLyra } from "../../src/browser/hugo-lyra-browser";
import { create, insert, search } from "@lyrasearch/lyra";
import { exportInstance } from "@lyrasearch/plugin-data-persistence";
import "node-self";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function generateTestDBInstance() {
  const db = await create({
    schema: {
      quote: "string",
      author: "string",
    },
  });

  await insert(db, {
    quote: "I am a great programmer",
    author: "Bill Gates",
  });

  await insert(db, {
    quote: "Be yourself; everyone else is already taken.",
    author: "Oscar Wilde",
  });

  await insert(db, {
    quote: "I have not failed. I've just found 10,000 ways that won't work.",
    author: "Thomas A. Edison",
  });

  await insert(db, {
    quote: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
  });

  return db;
}

t.test("Test bootstrap", t => {
  t.plan(1);
  t.test("bootstrap return a lyra database", async t => {
    t.plan(1);
    const db = (await generateTestDBInstance()) as any;
    const serializedData = exportInstance(db, "json");
    const dbRestored = await HugoLyra().restore(serializedData);
    const qp1 = await search(db, {
      term: "way",
    });
    const qp2 = await search(dbRestored, {
      term: "way",
    });
    t.same(qp1.hits, qp2.hits);
  });
});

t.test("Test search", t => {
  t.plan(2);

  t.test("should return a result when query string is valid", async t => {
    t.plan(1);

    const db = await generateTestDBInstance();

    const searchOptions = { term: "bill" };

    /* eslint-disable  @typescript-eslint/no-explicit-any */
    const res = await HugoLyra().search(db as any, searchOptions);
    const qp1 = await search(db, {
      term: "bill",
    });
    t.same(qp1.hits, res?.search.hits);
  });

  t.test("test sanitize", async t => {
    t.plan(3);

    const db = await generateTestDBInstance();

    const searchOptions = { term: "<script> alert('foobar') </script> alice" };
    const expected = "alice";

    /* eslint-disable  @typescript-eslint/no-explicit-any */
    const res = await HugoLyra().search(db as any, searchOptions);
    t.same(expected, res?.options.term);
    t.notSame(searchOptions.term, res?.options.term);

    /* eslint-disable  @typescript-eslint/no-explicit-any */
    const res2 = await HugoLyra().search(db as any, searchOptions, false);
    t.same(searchOptions.term, res2?.options.term);
  });
});

t.test("test fetchDb", t => {
  t.plan(4);

  t.test("raise an expcetion with a wrong url", async t => {
    t.plan(1);
    t.rejects(HugoLyra().fetchDb("not-working"));
  });

  t.test("raise an error because url does not work", async t => {
    t.plan(1);

    const { caches } = global;
    global.caches = undefined as any;
    t.teardown(() => (global.caches = caches) as any);

    fetchMockFunction = () => {
      const response = {
        ok: false,
      };
      return response;
    };
    t.rejects(HugoLyra().fetchDb("https://www.example.com"));
  });

  t.test("return the fetch without cache", async t => {
    t.plan(1);

    const { caches } = global;
    global.caches = undefined as any;
    t.teardown(() => (global.caches = caches) as any);

    const db = await generateTestDBInstance();
    const jsonDB = exportInstance(db, "json");

    fetchMockFunction = () => {
      const response = {
        ok: true,
        text: async () => {
          return jsonDB;
        },
        clone: () => {
          return jsonDB;
        },
      };
      return response;
    };
    const res = await HugoLyra().fetchDb("https://www.hugo.lyra/index.json");
    const rsearch = await search(res, {
      term: "bill",
    });
    t.same(1, rsearch.count);
  });

  t.test("return the fetch with cache", async t => {
    t.plan(5);
    const db = await generateTestDBInstance();
    const jsonDB = exportInstance(db, "json");

    // Mock console.
    const { log } = console;
    t.teardown(() => (console.log = log) as any);
    let logs = [] as any;
    console.log = (...m) => logs.push(m as never);

    fetchMockFunction = () => {
      const response = {
        ok: true,
        text: async () => {
          return jsonDB;
        },
        clone: (): any => {
          return "";
        },
      };
      response["clone"] = () => {
        return response;
      };
      return response;
    };

    const url = "https://www.hugo.lyra/index.json?cache=1234";
    const res = await HugoLyra().fetchDb(url);
    const rsearch = await search(res, {
      term: "bill",
    });
    t.same(1, rsearch.count);

    // now assert that cache is working.
    const res2 = await HugoLyra().fetchDb(url);
    const rsearch2 = await search(res2, {
      term: "bill",
    });
    t.same(1, rsearch2.count);
    const expected = [
      ["Cache not found with key: https://www.hugo.lyra/index.json?cache=1234"],
      ["Saving cache with key: https://www.hugo.lyra/index.json?cache=1234"],
      ["Cache found with key: https://www.hugo.lyra/index.json?cache=1234"],
    ];
    t.same(logs, expected);

    // Now make another a call disabling cache.
    logs = [];
    const res3 = await HugoLyra().fetchDb(url, false);
    const rsearch3 = await search(res3, {
      term: "bill",
    });
    t.same(1, rsearch3.count);
    t.same(logs, []);
  });
});
