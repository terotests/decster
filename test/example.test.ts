import { expect } from "chai";
import { serializers } from "../src/example/hello";

describe("example", () => {
  test("Hello.hello", async () => {
    expect(await serializers.Hello.unpack("Moro").hello("User")).to.deep.equal(
      "Moro User"
    );
  });
});
