/* eslint-disable @typescript-eslint/no-var-requires */
const { cwd } = require("process");
const { generateIndex } = require("hugo-lyra");

(async () => {
  const res = await generateIndex("./content", {
    indexFilePath: process.cwd(),
  });
  console.log(res);
})();
