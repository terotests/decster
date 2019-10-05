import { expect } from "chai";
import { Testing } from "../src/example/samplecode";

describe("Async test case 2", () => {
  test("Testing.timeout", async () => {
    expect(await new Testing().timeout(1234, "second test")).to.deep.equal([
      1,
      2,
      3,
      4,
      "second test"
    ]);
  });
});
