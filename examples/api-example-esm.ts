import { cwd } from "process";
import { generateIndex } from "hugo-lyra";
import { LyraOptions } from "hugo-lyra/dist/esm/types";

(async () => {
  const res = await generateIndex("./content", <LyraOptions>{
    indexFilePath: cwd(),
  });
  console.log(res);
})();
