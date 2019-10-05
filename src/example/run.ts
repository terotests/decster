import { testSuite } from "../";
import { Testing } from "./samplecode";
import * as R from "robowr";

const wrapToDescribeAndSave = (desc: string, fs: R.CodeFileSystem) => {
  fs.files.forEach(f => {
    const wr = f.getWriter();
    const start = f.getWriter().tag("start");
    start.out(`describe("${desc}", () => {`, true);
    start.indent(1);
    start.out("", true);
    wr.indent(-1);
    wr.out(`});`, true);
  });
  fs.saveTo("./test", { usePrettier: true });
};

async function run() {
  await testSuite.describe("tests", fs => {
    const t = new Testing();
    t.helloWorld(123, "OK");
    t.incState();
    t.incState();
    t.decState();
    t.decState();
    t.incState();
    t.mapItems([{ name: "john smith" }, { name: "arnold" }, { name: "joan" }]);
    wrapToDescribeAndSave("Syncronous test case", fs);
  });

  await testSuite.describe("tests2", async fs => {
    const t = new Testing();
    await t.timeout(3333, "<timeout>");
    wrapToDescribeAndSave("Async test case", fs);
  });

  await testSuite.describe("tests3", async fs => {
    const t = new Testing();
    await t.timeout(1234, "second test");
    wrapToDescribeAndSave("Async test case 2", fs);
  });
}
run();
