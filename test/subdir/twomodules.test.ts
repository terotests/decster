import { expect } from "chai";
import * as testclasses from "../../src/test/testclasses";
import * as another from "../../src/test/another";
describe("This test is created in a subfolder", () => {
  test("ClassWithDecorator.name", async () => {
    expect(
      await testclasses.serializers.ClassWithDecorator.unpack(null).name()
    ).to.deep.equal("name");
  });
  test("AnotherClassWithDecorator.name", async () => {
    expect(
      await another.serializers.AnotherClassWithDecorator.unpack(null).name()
    ).to.deep.equal("name");
  });
});
