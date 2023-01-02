import t from "tap";
import { HugoLyra, HugoLyraBrowserOptions } from "../../src/browser/hugo-lyra-browser";
import { create, insert, search } from "@lyrasearch/lyra";

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
