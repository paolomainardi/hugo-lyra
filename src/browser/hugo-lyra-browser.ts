// Thanks: https://stackoverflow.com/a/74112582
/// <reference lib="dom" />

import * as lyra from "@lyrasearch/lyra";
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
      options: HugoLyraBrowserOptions,
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
     *
     * @param url Url of the lyra index.
     * @returns
     */
    bootstrap: async function (url: string): Promise<lyra.Lyra<{ __placeholder: "string" }>> {
      const db = lyra.create({
        schema: {
          __placeholder: "string",
        },
      });
      const res = await fetch(url);
      if (!res.ok) {
        throw res.statusText;
      }
      const deserialized = await res.json();
      db.index = deserialized.index;
      db.defaultLanguage = deserialized.defaultLanguage;
      db.docs = deserialized.docs;
      db.nodes = deserialized.nodes;
      db.schema = deserialized.schema;
      db.frequencies = deserialized.frequencies;
      db.tokenOccurrencies = deserialized.tokenOccurrencies;
      return db;
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
