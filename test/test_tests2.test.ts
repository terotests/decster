import { expect } from "chai";
import { Testing } from "../src/example/samplecode";

describe("Async test case", () => {
  test("Testing.timeout", async () => {
    expect(await new Testing().timeout(3333, "<timeout>")).to.deep.equal([
      1,
      2,
      3,
      4,
      "<timeout>"
    ]);
  });
});
