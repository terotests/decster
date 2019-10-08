import { expect } from "chai";
import * as simple from "../src/example/simple";
describe("helloworld", () => {
  test("HelloWorld.setMessage", async () => {
    expect(
      await simple.serializers.HelloWorld.unpack({
        user: { id: 1000 },
        msg: "Hello World"
      }).setMessage("Hello Earth")
    ).to.deep.equal(undefined);
  });
  test("HelloWorld.getMessage", async () => {
    expect(
      await simple.serializers.HelloWorld.unpack({
        user: { id: 1000 },
        msg: "Hello Earth"
      }).getMessage()
    ).to.deep.equal("Hello Earth");
  });
  test("HelloWorld.getUser", async () => {
    expect(
      await simple.serializers.HelloWorld.unpack({
        user: { id: 1000 },
        msg: "Hello Earth"
      }).getUser()
    ).to.deep.equal({
      id: 1000
    });
  });
  test("HelloWorld.setUserId", async () => {
    expect(
      await simple.serializers.HelloWorld.unpack({
        user: { id: 1000 },
        msg: "Hello Earth"
      }).setUserId(0)
    ).to.deep.equal(undefined);
  });
  test("HelloWorld.getUser", async () => {
    expect(
      await simple.serializers.HelloWorld.unpack({
        user: { id: 0 },
        msg: "Hello Earth"
      }).getUser()
    ).to.deep.equal({
      id: 0
    });
  });
  test("HelloWorld.recursive", async () => {
    expect(
      await simple.serializers.HelloWorld.unpack({
        user: { id: 0 },
        msg: "Hello Earth"
      }).recursive("This could fail!!!")
    ).to.deep.equal("This could fail!!!");
  });
});
