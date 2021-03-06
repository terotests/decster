import { DecoratorTestSuite } from "..";
import { Testing, MoreComplexClass } from "./samplecode";
import { HelloWorld } from "./simple";
import { Hello } from "./hello";
import { ClassWithDecorator } from "../test/testclasses";
import {
  ClassWithoutDecorator,
  AnotherClassWithDecorator
} from "../test/another";

async function run() {
  await DecoratorTestSuite.describe("sampletests", async fs => {
    const t = new Testing();
    t.helloWorld(123, "OK");
    t.incState();
    t.incState();
    t.decState();
    t.decState();
    t.incState();
    t.mapItems([{ name: "john smith" }, { name: "arnold" }, { name: "joan" }]);
    await t.timeout(3333, "<timeout>");
    // t.method3(new MoreComplexClass(1234), "more complex class testing");
  });
  await DecoratorTestSuite.describe("helloworld", async fs => {
    const obj = new HelloWorld();
    obj.setMessage("Hello Earth");
    obj.getMessage();
    obj.getUser();
    obj.setUserId(0);
    obj.getUser();

    obj.recursive("This could fail!!!");
  });
  await DecoratorTestSuite.describe("example", async fs => {
    new Hello("Hello").hello("User");
    new Hello("What's up").hello("User");
  });

  await DecoratorTestSuite.describe(
    {
      name: "custom",
      describeBlock: () => {
        return [
          `describe("Here is a custom describe block for this test case", () => {`,
          `});`
        ];
      }
    },
    async fs => {
      new Hello("Hello").hello("User");
      new Hello("What's up").hello("User");
    }
  );

  await DecoratorTestSuite.describe(
    {
      name: "twomodules",
      description: "tests importing classes from two different modules"
    },
    async fs => {
      new ClassWithDecorator().name();
      new ClassWithoutDecorator().name();
      new AnotherClassWithDecorator().name();
    }
  );

  await DecoratorTestSuite.describe(
    {
      name: "twomodules",
      targetDir: "test/subdir/",
      description: "This test is created in a subfolder"
    },
    async fs => {
      new ClassWithDecorator().name();
      new ClassWithoutDecorator().name();
      new AnotherClassWithDecorator().name();
    }
  );
}
run();
