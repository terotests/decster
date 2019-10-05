import { expect } from "chai";
import { Testing } from "../src/example/samplecode";

describe("Syncronous test case", () => {
  test("Testing.helloWorld", async () => {
    expect(await new Testing().helloWorld(123, "OK")).to.deep.equal("OK : 123");
  });
  test("Testing.incState", async () => {
    expect(await new Testing().incState()).to.deep.equal(2);
  });
  test("Testing.incState", async () => {
    expect(await new Testing().incState()).to.deep.equal(3);
  });
  test("Testing.decState", async () => {
    expect(await new Testing().decState()).to.deep.equal(2);
  });
  test("Testing.decState", async () => {
    expect(await new Testing().decState()).to.deep.equal(1);
  });
  test("Testing.incState", async () => {
    expect(await new Testing().incState()).to.deep.equal(2);
  });
  test("Testing.mapItems", async () => {
    expect(
      await new Testing().mapItems([
        {
          name: "john smith"
        },
        {
          name: "arnold"
        },
        {
          name: "joan"
        }
      ])
    ).to.deep.equal([
      {
        ucName: "JOHN SMITH",
        lcName: "john smith"
      },
      {
        ucName: "ARNOLD",
        lcName: "arnold"
      },
      {
        ucName: "JOAN",
        lcName: "joan"
      }
    ]);
  });
});
