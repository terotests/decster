// the starting point of the applictaion decortest

import * as R from "robowr";

const fs = new R.CodeFileSystem();

const callParams: { [key: string]: R.CodeWriter } = {};

interface serializerArguments {
  msg?: string;
  arguments?: (wr: R.CodeWriter, self: any, args: any[]) => string;
  value?: (wr: R.CodeWriter, self: any, args: any[]) => string;
}

export function logMethod(opts?: serializerArguments) {
  const options = {
    arguments:
      opts && opts.arguments
        ? opts.arguments
        : (wr, self, args) => JSON.stringify(args),
    value:
      opts && opts.value ? opts.value : (wr, self, args) => JSON.stringify(args)
  };
  return function(
    target: Object,
    propertyName: string,
    propertyDesciptor: PropertyDescriptor
  ): PropertyDescriptor {
    // save the original method
    const method = propertyDesciptor.value;

    console.log("Class Name ? ", target.constructor.name);

    propertyDesciptor.value = function(...args: any[]) {
      // function which was called
      const wr = fs.getFile("/", `test_${propertyName}.ts`).getWriter();

      // instance call initialization
      if (!callParams[propertyName]) {
        // start tag for the
        wr.tag("start");
        wr.out(`export const methodCalls = [`, true);
        wr.indent(1);
        callParams[propertyName] = wr.fork();
        wr.indent(-1);
        wr.out(`]`, true);
      }

      // save the call parameters
      callParams[propertyName].out(
        `{arguments : ${options.arguments(wr, this, args)},`,
        true
      );
      const result = method.apply(this, args);
      callParams[propertyName].out(
        `result : ${options.value(wr, this, result)}},`,
        true
      );
      // return the result of invoking the method
      return result;
    };
    return propertyDesciptor;
  };
}

class MoreComplexClass {
  a = 0;
  constructor(a: number) {
    this.a = a;
  }
  getCnt() {
    return this.a;
  }
}

class Testing {
  user = {
    id: 1000
  };

  @logMethod()
  helloWorld(cnt: number, text: string) {
    return `${text} : ${cnt}`;
  }

  // runtime type checking for certain classes could be done here
  @logMethod({
    // serializing the arguments for the test case
    arguments: (wr, self, args: any[]) => {
      wr.tag("start").out(`// call for user ${self.user.id}`, true);
      return `/*${args[0].getCnt()}*/ ${JSON.stringify(args.slice(1))}`;
    }
  })
  method2(cnt: MoreComplexClass, text: string) {
    return `${text} : ${cnt.getCnt()}`;
  }
}

export function HelloWorld() {
  return "Hello World!";
}

new Testing().helloWorld(10, "JeeJEe!!!");
new Testing().helloWorld(90, "Something else here then");
new Testing().method2(new MoreComplexClass(1234), "Something else here then");
new Testing().method2(
  new MoreComplexClass(1234),
  "Something else here then, 2"
);

fs.saveTo("./output", { usePrettier: true });

// to use:
// npm install reflect-metadata --save
// npm install class-transformer --save
