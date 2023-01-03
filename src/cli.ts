#!/usr/bin/env node
import { parse } from "ts-command-line-args";
import { generateIndex } from "./hugo-lyra";
import { LyraOptions } from "./types";
import pino from "pino";

let logger = pino();

interface CliOptions extends LyraOptions {
  content: string;
  help?: boolean;
  verbose?: boolean;
  prettyPrint?: boolean;
}

(async () => {
  try {
    const args = parse<CliOptions>(
      {
        content: { type: String, description: "Hugo contents directory" },
        indexFilePath: { type: String, optional: true, description: "Path to store the Lyra index (default: public/)" },
        indexDefaultLang: {
          type: String,
          optional: true,
          description: "Lyra index default language (default: english)",
        },
        indexFormat: { type: String, optional: true, description: "Lyra index format (default: binary)" },
        verbose: { type: Boolean, alias: "v", optional: true, description: "Print the indexed lyra documents" },
        prettyPrint: { type: Boolean, optional: true, description: "Pretty print the logs" },
        help: { type: Boolean, optional: true, alias: "h", description: "Prints this usage guide" },
      },
      {
        helpArg: "help",
      },
    );

    // Configure logger.
    let loggerConf = {};
    if (args.prettyPrint) {
      loggerConf = {
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: true,
          },
        },
      };
    }
    logger = pino(loggerConf);

    // Generate index.
    const res = await generateIndex(args.content, {
      indexFilePath: args.indexFilePath ?? undefined,
      indexDefaultLang: args.indexDefaultLang,
      indexFormat: args.indexFormat,
    });

    // Print the stats.
    const { docs } = res;
    delete res["docs"];
    logger.info(res);

    // Print the documents.
    if (args.verbose) {
      logger.info(docs);
    }
  } catch (e) {
    logger.error(e);
  }
})();
