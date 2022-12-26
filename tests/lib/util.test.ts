import t from "tap";
import { filterObject } from "../../src/lib/utils";

t.test("Test filter object", t => {
  t.plan(2);

  t.test("should remove empty or undefined elements", t => {
    t.plan(1);
    const obj = {
      test: 1234,
      empty: undefined,
      empty2: "",
    };
    const expected = {
      test: 1234,
    };
    const res = filterObject(obj, ([_, val]) => {
      _;
      return !!val;
    });
    t.same(expected, res);
  });

  t.test("should remove all not strings and empty string elements", t => {
    t.plan(1);
    const obj = {
      str: "string",
      number: 1234,
      obj: [],
      empty: "",
      undef: undefined,
      object: {},
    };
    const expected = {
      str: "string",
    };
    const res = filterObject(obj, ([_, val]) => {
      _;
      return typeof val === "string" && !!val;
    });
    t.same(expected, res);
  });
});
