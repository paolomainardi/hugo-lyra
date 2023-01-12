// Thanks: https://stackoverflow.com/a/74112582
/// <reference lib="dom" />
import * as lyra from "@lyrasearch/lyra";
import { SearchParams } from "@lyrasearch/lyra/dist/methods/search";
import { Lyra, PropertiesSchema } from "@lyrasearch/lyra/dist/types";
import DOMPurify from "isomorphic-dompurify";
import { importInstance } from "@lyrasearch/plugin-data-persistence";

export function HugoLyra() {
  return {
    lyra,
    restore: importInstance,

    /**
     *
     * @param url Url of the lyra file.
     * @param cache Use the browser cache.
     * @returns
     */
    fetchDb: async function <T extends PropertiesSchema>(url: string, cache = true): Promise<Lyra<T>> {
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

      // Get the index and restore, we work on a cloned object
      // to make it still available to the cache.
      const r = response.clone();
      const index = await r.text();
      const db = await importInstance(index, "json");

      // Save cache now that we are sure we can restore it.
      if (cacheAvailable && !cacheFound) {
        console.log(`Saving cache with key: ${url}`);
        const cache = await caches.open(url);
        await cache.put(url, response);
      }
      return db as Lyra<T>;
    },

    /**
     * Search on a Lyra index, it can also sanitize the query string term by default.
     *
     * @param db Lyra database
     * @param options Lyra search options
     * @param sanitize Sanitize the search term string
     * @returns an object {search: SearchResult, options: SearchParams}
     */
    search: async function <T extends PropertiesSchema>(db: Lyra<T>, options: SearchParams<T>, sanitize = true) {
      const clonedOps = { ...options };
      if (sanitize) {
        clonedOps.term = DOMPurify.sanitize(options.term);
      }
      const search = await this.lyra.search(db, options);
      return {
        search,
        options: clonedOps,
      };
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
