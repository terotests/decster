// the starting point of the applictaion decortest

import * as R from "robowr";

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
  fs = new R.CodeFileSystem();
  isRunning = false;
  callParams: { [key: string]: R.CodeWriter } = {};
  testName = "";
  callCnt = 0;

  async describe(name: string, runner: (fs: R.CodeFileSystem) => any) {
    this.fs = new R.CodeFileSystem();
    this.start(name);
    await runner(this.fs);
    this.end();
    return this.fs;
  }

  private start(testName: string) {
    this.isRunning = true;
    this.testName = testName;
    this.callCnt = 0;
  }
  private end() {
    this.isRunning = true;
  }
}

export const testSuite = new TestCaseRunner();

export interface serializerArguments {
  enabled?: boolean;
  dirName?: string;
  fileName?: string;
  firstCall?: (info: MethodInfo) => R.CodeWriter;
  wrapMethod?: (info: MethodInfo) => R.CodeWriter;
  arguments?: (info: MethodInfo) => void;
  value?: (info: MethodInfo) => void;
  after?: (info: MethodInfo) => void;
}

export function TEST(opts?: serializerArguments) {
  const options: serializerArguments = {
    arguments:
      opts && opts.arguments ? opts.arguments : (info: MethodInfo) => {},
    value: opts && opts.value ? opts.value : (info: MethodInfo) => {},
    fileName: opts && opts.fileName ? opts.fileName : null,
    dirName: opts && opts.dirName ? opts.dirName : null
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
        wr: testSuite.fs
          .getFile(
            options.dirName || "/",
            options.fileName || `test_${testSuite.testName}.test.ts`
          )
          .getWriter(),
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
      const d = method.apply(this, args);

      if (d && d.then) {
        d.then(resolvedData => {
          data.result = resolvedData;
          options.value(data);
          if (opts.after) {
            opts.after(data);
          }
        });
      } else {
        data.result = d;
        options.value(data);
        if (opts.after) {
          opts.after(data);
        }
      }
      testSuite.callCnt++;
      return d;
    };
    return propertyDesciptor;
  };
}
