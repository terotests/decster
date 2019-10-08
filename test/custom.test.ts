import { expect } from "chai";
import * as hello from "../src/example/hello";
describe("Here is a custom describe block for this test case", () => {
  test("Hello.hello", async () => {
    expect(
      await hello.serializers.Hello.unpack("Hello").hello("User")
    ).to.deep.equal("Hello User");
  });
  test("Hello.hello", async () => {
    expect(
      await hello.serializers.Hello.unpack("What's up").hello("User")
    ).to.deep.equal("What's up User");
  });
});
