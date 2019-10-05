import { testSuite } from "../";
import { Testing } from "./samplecode";
import { MoreComplexClass } from "./samplecode";
import * as fs from "fs";

testSuite.start("testrun1");
new Testing().method2(new MoreComplexClass(1234), "Something else here then");
new Testing().method2(
  new MoreComplexClass(1234),
  "Something else here then, 2"
);
new Testing().method3(
  new MoreComplexClass(1234),
  "Something else here then, 2"
);

new Testing().incState();
new Testing().incState();
new Testing().decState();
new Testing().decState();
new Testing().incState();

testSuite.saveTo("./test");

// to use:
// npm install reflect-metadata --save
// npm install class-transformer --save
