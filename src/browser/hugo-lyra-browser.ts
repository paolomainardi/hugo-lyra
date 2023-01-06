// Thanks: https://stackoverflow.com/a/74112582
/// <reference lib="dom" />

import * as lyra from "@lyrasearch/lyra";
import { PropertiesSchema } from "@lyrasearch/lyra";
import DOMPurify from "isomorphic-dompurify";

export function HugoLyra() {
  return {
    lyra,

    /**
     *
     * @param url Url of the lyra file.
     * @param cache Use the browser cache.
     * @returns
     */
    fetchDb: async function <T extends PropertiesSchema>(url: string, cache = true): Promise<lyra.Lyra<T>> {
      /*if (HugoLyra.db) {
        console.log("DB Found returning");
        return HugoLyra.db;
      }
      */
      const cacheAvailable = "caches" in self && typeof caches !== "undefined" && cache;
      const request = new Request(url);
      let response: Response | undefined;
      let cacheFound = false;
      if (cacheAvailable) {
        response = await caches.match(url);
        const tpl = `Cache %not found with key: ${url}`;
        if (response) {
          cacheFound = true;
        }
        const message = response ? tpl.replace("%not ", "") : tpl.replace("%", "");
        console.log(message);
      }
      if (!response) {
        response = await fetch(request);
      }
      if (!response.ok) {
        throw new Error(`Error fetching index on: ${url}`);
      }
      if (cacheAvailable && !cacheFound) {
        console.log(`Saving cache with key: ${url}`);
        const cache = await caches.open(url);
        const r = response.clone();
        await cache.put(url, r);
      }
      const index = await response.text();
      const db = this.restore(index);
      return db as lyra.Lyra<T>;
    },

    /**
     *
     * @param db
     * @param options
     * @param sanitize
     * @returns
     */
    search: function <T extends PropertiesSchema>(db: lyra.Lyra<T>, options: lyra.SearchParams<T>, sanitize = true) {
      const clonedOps = { ...options };
      if (sanitize) {
        clonedOps.term = DOMPurify.sanitize(options.term);
      }
      const search = this.lyra.search(db, options);
      return {
        search,
        options: clonedOps,
      };
    },

    /**
     * Read the remote index file and return the lyra index, it supports just JSON now.
     * @TODO: Use https://github.com/LyraSearch/plugin-data-persistence/blob/main/src/common/utils.ts
     *        once it will be working on browser too. See issue: https://github.com/LyraSearch/plugin-data-persistence/pull/10
     *
     * @param url Url of the lyra index.
     * @returns
     */
    restore: function <T extends PropertiesSchema>(data: string | Buffer): lyra.Lyra<T> {
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
}

declare global {
  interface Window {
    HugoLyra: object;
  }
}
if (typeof window !== "undefined") {
  window.HugoLyra = HugoLyra();
}
