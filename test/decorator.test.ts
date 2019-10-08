import { expect } from "chai";
import { TEST } from "../src";
import { ClassWithDecorator } from "../src/test/testclasses";
import { ClassWithoutDecorator } from "../src/test/another";

describe("Test Decorator function", () => {
  test("Test Class without any decorator", async () => {
    const obj = new ClassWithoutDecorator();
    expect(obj.name.toString().length).to.be.lessThan(300);
    const obj2 = new ClassWithDecorator();
    expect(obj2.name.toString().length).to.be.greaterThan(300);
  });
});
