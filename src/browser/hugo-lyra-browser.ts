// Thanks: https://stackoverflow.com/a/74112582
/// <reference lib="dom" />

import * as lyra from "@lyrasearch/lyra";
import { PropertiesSchema } from "@lyrasearch/lyra";
import DOMPurify from "isomorphic-dompurify";
import { filterObject } from "../lib/utils";

export type HugoLyraBrowserOptions = {
  queryString?: string;
  param?: string;
};

export const HugoLyra = () => {
  return {
    lyra,

    /**
     *
     * @param db Lyra database instance
     * @param qparam Query string parameter
     * @returns
     */
    search: function (
      db: lyra.Lyra<{
        schema: {
          __placeholder: "string";
        };
      }>,
      options: HugoLyraBrowserOptions = {},
    ) {
      const defaultOpts: HugoLyraBrowserOptions = {
        queryString: typeof window !== "undefined" ? window.location.search : "",
        param: "q",
      };

      // Remove all undefined, empty and not strings eleemn
      const filterOptions = filterObject(options, ([_, val]) => {
        _;
        return typeof val === "string" && !!val;
      });
      const opts = { ...defaultOpts, ...filterOptions };
      const params = new URLSearchParams(opts.queryString);
      const query = params.get(opts.param ?? "q");
      if (!query) {
        return;
      }
      const sanitized = DOMPurify.sanitize(query);
      const search = this.lyra.search(db, {
        term: sanitized,
        properties: "*",
      });
      return {
        search,
        q: sanitized,
      };
    },

    /**
     * Read the remote index file and return the lyra index.
     * @TODO: Use https://github.com/LyraSearch/plugin-data-persistence/blob/main/src/common/utils.ts
     *        once it will be working on browser too. See issue: https://github.com/LyraSearch/plugin-data-persistence/pull/10
     *
     * @param url Url of the lyra index.
     * @returns
     */
    bootstrap: function <T extends PropertiesSchema>(data: string | Buffer): lyra.Lyra<T> {
      const db = lyra.create({
        schema: {
          __placeholder: "string",
        },
      });
      const deserialized = JSON.parse(data.toString());
      db.index = deserialized.index;
      db.defaultLanguage = deserialized.defaultLanguage;
      db.docs = deserialized.docs;
      db.nodes = deserialized.nodes;
      db.schema = deserialized.schema;
      db.frequencies = deserialized.frequencies;
      db.tokenOccurrencies = deserialized.tokenOccurrencies;
      return db as unknown as lyra.Lyra<T>;
    },
  };
};

declare global {
  interface Window {
    HugoLyra: object;
  }
}
if (typeof window !== "undefined") {
  window.HugoLyra = HugoLyra();
}
