import { expect } from "chai";
import { Testing, MoreComplexClass } from "../src/example/samplecode";
Testing.resetState();

test("Testing.method2", async () => {
  expect(
    new Testing().method2(
      new MoreComplexClass(1234),
      "Something else here then"
    )
  ).to.deep.equal("Something else here then : 1234");
});
test("Testing.method2", async () => {
  expect(
    new Testing().method2(
      new MoreComplexClass(1234),
      "Something else here then, 2"
    )
  ).to.deep.equal("Something else here then, 2 : 1234");
});
test("Testing.method3", async () => {
  expect(
    new Testing().method3(
      new MoreComplexClass(1234),
      "Something else here then, 2"
    )
  ).to.deep.equal({ count: 1234, text: "Something else here then, 2" });
});
test("Testing.incState", async () => {
  expect(new Testing().incState()).to.deep.equal(2);
});
test("Testing.incState", async () => {
  expect(new Testing().incState()).to.deep.equal(3);
});
test("Testing.decState", async () => {
  expect(new Testing().decState()).to.deep.equal(2);
  console.log("Dec called");
});
test("Testing.decState", async () => {
  expect(new Testing().decState()).to.deep.equal(1);
  console.log("Dec called");
});
test("Testing.incState", async () => {
  expect(new Testing().incState()).to.deep.equal(2);
});
