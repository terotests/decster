// the starting point of the applictaion decortest

import * as R from "robowr";

let fs = new R.CodeFileSystem();

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
    fs = new R.CodeFileSystem();
    this.isRunning = true;
    this.testName = testName;
    this.callCnt = 0;
  }
  end(testName: string) {
    this.isRunning = true;
    this.testName = testName;
  }
  saveTo(path: string) {
    fs.saveTo(path, { usePrettier: true });
  }
}

export const testSuite = new TestCaseRunner();

export interface serializerArguments {
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
    propertyDesciptor.value = function(...args: any[]) {
      if (!testSuite.isRunning) {
        return method.apply(this, args);
      }
      const data: MethodInfo = {
        wr: fs.getFile("/", `test_${testSuite.testName}.test.ts`).getWriter(),
        self: this,
        args,
        className,
        methodName,
        runner: testSuite
      };
      if (testSuite.callCnt === 0) {
        if (opts.firstCall) {
          data.wr = opts.firstCall(data);
        }
      }
      if (opts.wrapMethod) {
        data.wr = opts.wrapMethod(data);
      }
      options.arguments(data);
      data.result = method.apply(this, args);
      options.value(data);
      if (opts.after) {
        opts.after(data);
      }
      testSuite.callCnt++;
      return data.result;
    };
    return propertyDesciptor;
  };
}
