import { restoreFromFile } from "@lyrasearch/plugin-data-persistence";

function loadFile(path: string, format = "binary") {
  return restoreFromFile(format, path);
}
