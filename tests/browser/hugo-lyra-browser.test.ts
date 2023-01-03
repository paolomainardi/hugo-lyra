import t from "tap";
import { HugoLyra, HugoLyraBrowserOptions } from "../../src/browser/hugo-lyra-browser";
import { create, insert, Lyra, search } from "@lyrasearch/lyra";
import { exportInstance } from "@lyrasearch/plugin-data-persistence";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function generateTestDBInstance(): Lyra<any> {
  const db = create({
    schema: {
      quote: "string",
      author: "string",
    },
  });

  insert(db, {
    quote: "I am a great programmer",
    author: "Bill Gates",
  });

  insert(db, {
    quote: "Be yourself; everyone else is already taken.",
    author: "Oscar Wilde",
  });

  insert(db, {
    quote: "I have not failed. I've just found 10,000 ways that won't work.",
    author: "Thomas A. Edison",
  });

  insert(db, {
    quote: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
  });

  return db;
}

t.test("Test bootstrap", t => {
  t.plan(1);
  t.test("bootstrap return a lyra database", t => {
    t.plan(1);
    const db = generateTestDBInstance();
    const serializedData = exportInstance(db, "json");
    const dbRestored = HugoLyra().bootstrap(serializedData);
    const qp1 = search(db, {
      term: "way",
    });
    const qp2 = search(dbRestored, {
      term: "way",
    });
    t.same(qp1.hits, qp2.hits);
  });
});

t.test("Test search", t => {
  t.plan(4);

  t.test("should return undefined when querystring is empty", t => {
    t.plan(1);

    const db = create({
      schema: {
        quote: "string",
        author: "string",
      },
    });

    const opts: HugoLyraBrowserOptions = {
      queryString: "",
    };
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    const res = HugoLyra().search(db as any, opts);
    t.same(undefined, res);
  });

  t.test("should return undefined when param is not part of querystring", t => {
    t.plan(1);

    const db = create({
      schema: {
        quote: "string",
        author: "string",
      },
    });

    const opts: HugoLyraBrowserOptions = {
      queryString: "?q=foo",
      param: "bar",
    };
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    const res = HugoLyra().search(db as any, opts);
    t.same(undefined, res);
  });

  t.test("should return undefined when querystring and param are empty", t => {
    t.plan(1);

    const db = create({
      schema: {
        quote: "string",
        author: "string",
      },
    });

    const opts: HugoLyraBrowserOptions = {
      queryString: "",
      param: "",
    };
    const res = HugoLyra().search(db as any, opts);
    t.same(undefined, res);
  });

  t.test("should return a result when query string is valid", t => {
    t.plan(1);

    const db = create({
      schema: {
        quote: "string",
        author: "string",
      },
    });
    insert(db, {
      quote: "I am a great programmer",
      author: "Bill Gates",
    });
    const opts: HugoLyraBrowserOptions = {
      queryString: "?q=bill",
    };
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    const res = HugoLyra().search(db as any, opts);
    const qp1 = search(db, {
      term: "bill",
    });
    t.same(qp1.hits, res?.search.hits);
  });
});
