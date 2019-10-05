// the starting point of the applictaion decortest

import * as R from "robowr";

const fs = new R.CodeFileSystem();

// state of test case recording

export interface MethodInfo {
  runner: TestCaseRunner;
  className: string;
  methodName: string;
  args: any[];
  self: any;
  wr: R.CodeWriter;
  result?: any;
}

export class TestCaseRunner {
  isRunning = false;
  callParams: { [key: string]: R.CodeWriter } = {};
  testName = "";
  callCnt = 0;

  start(testName: string) {
    this.isRunning = true;
    this.testName = testName;
    this.callCnt = 0;
  }
  end(testName: string) {
    this.isRunning = true;
    this.testName = testName;
  }
}

export const testSuite = new TestCaseRunner();

interface serializerArguments {
  firstCall?: (info: MethodInfo) => R.CodeWriter;
  wrapMethod?: (info: MethodInfo) => R.CodeWriter;
  arguments?: (info: MethodInfo) => void;
  value?: (info: MethodInfo) => void;
  after?: (info: MethodInfo) => void;
}

export function testParams(opts?: serializerArguments) {
  const options: serializerArguments = {
    arguments:
      opts && opts.arguments ? opts.arguments : (info: MethodInfo) => {},
    value: opts && opts.value ? opts.value : (info: MethodInfo) => {}
  };
  return function(
    target: Object,
    propertyName: string,
    propertyDesciptor: PropertyDescriptor
  ): PropertyDescriptor {
    // save the original method
    const method = propertyDesciptor.value;
    const className = target.constructor.name;
    const methodName = propertyName;
    const signature = `${target.constructor.name}.${propertyName}`;
    propertyDesciptor.value = function(...args: any[]) {
      if (!testSuite.isRunning) {
        return method.apply(this, args);
      }
      // function which was called
      let wr = fs
        .getFile("/", `test_${testSuite.testName}.test.ts`)
        .getWriter();

      if (testSuite.callCnt === 0) {
        if (opts.firstCall) {
          wr = opts.firstCall({
            wr,
            self: this,
            args,
            className,
            methodName,
            runner: testSuite
          });
        }
      }
      if (opts.wrapMethod) {
        wr = opts.wrapMethod({
          wr,
          self: this,
          args,
          className,
          methodName,
          runner: testSuite
        });
      }
      options.arguments({
        wr,
        self: this,
        args,
        className,
        methodName,
        runner: testSuite
      });
      const result = method.apply(this, args);
      options.value({
        wr,
        self: this,
        args,
        result,
        className,
        methodName,
        runner: testSuite
      });

      if (opts.after) {
        opts.after({
          wr,
          self: this,
          args,
          result,
          className,
          methodName,
          runner: testSuite
        });
      }

      testSuite.callCnt++;
      // return the result of invoking the method
      return result;
    };
    return propertyDesciptor;
  };
}

export class MoreComplexClass {
  a = 0;
  constructor(a: number) {
    this.a = a;
  }
  getCnt() {
    return this.a;
  }
}

const testCaseSetup = {
  firstCall: args => {
    // initialize the test function, import libraries etc.
    args.wr.out(`import { expect } from 'chai'`, true);
    args.wr.out(
      `import { Testing, MoreComplexClass } from '../src/index'
      Testing.resetState();      
      `,
      true
    );
    return args.wr;
  },
  arguments: args => {
    const wr = args.wr;
    args.args.forEach((arg, index) => {
      if (index > 0) {
        wr.out(", ");
      }
      if (index === 0) {
        wr.out(`new MoreComplexClass(${arg.a})`, true);
      } else {
        wr.out(JSON.stringify(arg));
      }
    });
    wr.out("))", true);
  },
  wrapMethod: args => {
    // arguments for the test suite...
    args.wr.out(
      `test( "${args.className}.${args.methodName}", async () => {`,
      true
    );
    args.wr.indent(1);
    // create the class which is ready to be called
    args.wr.out(`expect( new ${args.className}().${args.methodName}(`, true);
    const testcaseWriter = args.wr.fork();
    args.wr.indent(-1);
    args.wr.out(`})`, true);
    return testcaseWriter;
  },
  value: args => {
    args.wr.out(`.to.deep.equal(${JSON.stringify(args.result)})`);
  }
};

let globalState = 1;

export class Testing {
  user = {
    id: 1000
  };

  static resetState() {
    globalState = 1;
  }

  @testParams()
  helloWorld(cnt: number, text: string) {
    return `${text} : ${cnt}`;
  }

  // runtime type checking for certain classes could be done here
  @testParams(testCaseSetup)
  method2(cnt: MoreComplexClass, text: string) {
    return `${text} : ${cnt.getCnt()}`;
  }

  @testParams(testCaseSetup)
  method3(cnt: MoreComplexClass, text: string) {
    return { count: cnt.a, text };
  }

  @testParams(testCaseSetup)
  incState() {
    return ++globalState;
  }

  @testParams({
    ...testCaseSetup,
    after: args => {
      args.wr.newline();
      args.wr.out(`console.log('Dec called');`, true);
    }
  })
  decState() {
    return --globalState;
  }
}

export function HelloWorld() {
  return "Hello World!";
}

testSuite.start("testrun1");
new Testing().method2(new MoreComplexClass(1234), "Something else here then");
new Testing().method2(
  new MoreComplexClass(1234),
  "Something else here then, 2"
);
new Testing().method3(
  new MoreComplexClass(1234),
  "Something else here then, 2"
);

new Testing().incState();
new Testing().incState();
new Testing().decState();
new Testing().decState();
new Testing().incState();

fs.saveTo("./test", { usePrettier: true });

// to use:
// npm install reflect-metadata --save
// npm install class-transformer --save
