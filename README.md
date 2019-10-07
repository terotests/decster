# Decster, Regression testing tool for TypeScript or JavaScript

Automates the test case parameter and return value validation by creating test cases
for Jest testing tool from the results for the functions which are run using decorators
defined in Decster.

## Why?

When you know your code works, it would be nice to record test cases at that point in case
you later break the code, to avoid regression.

## Ok, so what was difficult in this?

I don't know, I just could not find a good tool for this and created one.

I guess you could just use simple logger decorator and `JSON.stringify` the result but then you can not save classes or more complex values.

Also you have to be careful if the returned value is a Promise or something that can not be trivially serialized to JSON. Furthermore, you should only serialize if test cases are running and also be careful that recursively calling recorded functions does not affect re results negatively.

To sum it up, the hard parts were:

1. Serializing parameters and return values so that actual test cases can be written
2. Automatically importing the modules for the test cases into the test cases folder
3. Preventing recursion
4. Handling function returning Promises

And there are still some challenges ahead, like adding support to more diverse set of tools and
different kind of test scenarios.

## So, this still a Work in Progress, right?

Yes. Do not use in production unless you are prepared to fix some bugs.

## How to use it

```
npm install --save decster
```

The tool can create test cases automatically if

1. classed are decorated with `@TEST(__filename)`
2. serializers are defined for all classes, including classes used as parameters or return values

So, we have a simple class like and we want to test the `hello` function.

```typescript
export class Hello {
  message = "Hello";
  constructor(message) {
    this.message = message;
  }
  hello(name: string) {
    return `${this.message} ${name}`;
  }
}
```

To make it automatically testable we have to

1. Import `TEST` decorator
2. Implement serializers for all non trivial classes
3. Add decorators for functions to be testeds

```typescript
import { TEST } from "decster";

// IMPORTANT: serializers must be defined before the class, otherwise the decorator can not use them
export const serializers = {
  // must be defined for each non trivially serializable entity, including the class used in test
  Hello: {
    // obj has the run-time instance, which is serialized here to JSON serializable Object
    pack: obj => obj.message,
    // here the Object is unpacked and we should create the corresponding instance out of it
    unpack: value => new Hello(value)
  }
};

// here is the class we are testing
export class Hello {
  message = "Hello";
  constructor(message) {
    this.message = message;
  }
  @TEST(__filename)
  hello(name: string) {
    return `${this.message} ${name}`;
  }
}
```

Then to create the actual test you have to run the instance of `Hello` in test case generator function.

```typescript
import { DecoratorTestSuite } from "..";
import { Hello } from "./hello";

await DecoratorTestSuite.describe("example", async fs => {
  // these calls are recorded
  new Hello("Hello").hello("User");
  new Hello("What's up").hello("User");
});
```

This will generate automatically corresponding test case in `test/` folder

```typescript
import { expect } from "chai";
import { serializers } from "../src/example/hello";

describe("example", () => {
  test("Hello.hello", async () => {
    expect(
      await serializers.Hello.unpack(undefined).hello("User")
    ).to.deep.equal("Hello User");
  });
});
```

# Licence

MIT.
