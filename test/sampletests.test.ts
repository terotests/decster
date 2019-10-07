import { expect } from "chai";
import { serializers } from "../src/example/samplecode";

describe("sampletests", () => {
  test("Testing.helloWorld", async () => {
    expect(
      await serializers.Testing.unpack({ id: 1000 }).helloWorld(123, "OK")
    ).to.deep.equal("OK : 123");
  });
  test("Testing.incState", async () => {
    expect(
      await serializers.Testing.unpack({ id: 1000 }).incState()
    ).to.deep.equal(2);
  });
  test("Testing.incState", async () => {
    expect(
      await serializers.Testing.unpack({ id: 1000 }).incState()
    ).to.deep.equal(3);
  });
  test("Testing.decState", async () => {
    expect(
      await serializers.Testing.unpack({ id: 1000 }).decState()
    ).to.deep.equal(2);
  });
  test("Testing.decState", async () => {
    expect(
      await serializers.Testing.unpack({ id: 1000 }).decState()
    ).to.deep.equal(1);
  });
  test("Testing.incState", async () => {
    expect(
      await serializers.Testing.unpack({ id: 1000 }).incState()
    ).to.deep.equal(2);
  });
  test("Testing.mapItems", async () => {
    expect(
      await serializers.Testing.unpack({ id: 1000 }).mapItems([
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
  test("Testing.timeout", async () => {
    expect(
      await serializers.Testing.unpack({ id: 1000 }).timeout(3333, "<timeout>")
    ).to.deep.equal([1, 2, 3, 4, "<timeout>"]);
  });
});
