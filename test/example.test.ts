import { expect } from "chai";
import { serializers } from "../src/example/hello";

describe("example", () => {
  test("Hello.hello", async () => {
    expect(await serializers.Hello.unpack("Hello").hello("User")).to.deep.equal(
      "Hello User"
    );
  });
  test("Hello.hello", async () => {
    expect(
      await serializers.Hello.unpack("What's up").hello("User")
    ).to.deep.equal("What's up User");
  });
});
