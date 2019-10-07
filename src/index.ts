// the starting point of the applictaion decortest

import * as R from "robowr";
import * as path from "path";

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
  isRecording = false;
  callParams: { [key: string]: R.CodeWriter } = {};
  testName = "";
  callCnt = 0;
  path = "./test";

  async describe(name: string, runner: (runner: TestCaseRunner) => any) {
    this.fs = new R.CodeFileSystem();
    this.start(name);
    await runner(this);
    this.end();
    this.fs.files.forEach(f => {
      const wr = f.getWriter();
      const start = f.getWriter().tag("start");
      start.out(`describe("${name}", () => {`, true);
      start.indent(1);
      start.out("", true);
      wr.indent(-1);
      wr.out(`});`, true);
    });
    this.fs.saveTo(this.path, { usePrettier: true });
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

export const DecoratorTestSuite = new TestCaseRunner();

const isJSONSerializable = (name: string) => {
  return (
    name === "Number" ||
    name === "Boolean" ||
    name === "String" ||
    name === "Object" ||
    name === "Array" ||
    name === "Null"
  );
};

export interface serializerArguments {
  enabled?: boolean;
  dirName?: string;
  fileName?: string;
}

export function TEST(__file: string, opts?: serializerArguments) {
  const options: serializerArguments = {
    fileName: opts && opts.fileName ? opts.fileName : null,
    dirName: opts && opts.dirName ? opts.dirName : null
  };
  return function(
    target: Object,
    propertyName: string,
    propertyDesciptor: PropertyDescriptor
  ): PropertyDescriptor {
    const modPath = __file
      .split(".")
      .slice(0, -1)
      .join(".");

    const mod = require(modPath);

    if (!mod.serializers) {
      throw `Modules which are to be tested must have serializers, problems with class ${propertyName} : ${__file}`;
    }

    const serialize = arg => {
      if (
        arg &&
        arg.constructor &&
        arg.constructor.name &&
        !isJSONSerializable(arg.constructor.name)
      ) {
        if (!mod.serializers[arg.constructor.name]) {
          throw `class ${arg.constructor.name} should have a serializer`;
        }
        const serialized = JSON.stringify(
          mod.serializers[arg.constructor.name].pack(arg)
        );
        return `serializers.${className}.unpack(${serialized})`;
      } else {
        return JSON.stringify(arg, null, 2);
      }
    };
    const method = propertyDesciptor.value;
    const className = target.constructor.name;
    const methodName = propertyName;
    propertyDesciptor.value = function(...args: any[]) {
      if (!DecoratorTestSuite.isRunning || DecoratorTestSuite.isRecording) {
        return method.apply(this, args);
      }

      const data: MethodInfo = {
        wr: DecoratorTestSuite.fs
          .getFile(
            options.dirName || "/",
            options.fileName || `${DecoratorTestSuite.testName}.test.ts`
          )
          .getWriter(),
        self: this,
        args,
        className,
        methodName,
        runner: DecoratorTestSuite
      };
      if (DecoratorTestSuite.callCnt === 0) {
        const relPath = path.relative("./dist/test", modPath);
        const wr = data.wr;
        wr.out(`import { expect } from 'chai'`, true);
        wr.out(
          `import { serializers } from '${relPath}'  
          `,
          true
        );
        wr.tag("start"); // if you need to insert code later
      }
      const wr = data.wr;
      if (!mod.serializers[className]) {
        throw `class ${className} should have a serializer`;
      }
      wr.out(`test( "${className}.${methodName}", async () => {`, true);
      wr.indent(1);

      const serialized = JSON.stringify(mod.serializers[className].pack(this));
      wr.out(
        `expect( await ((serializers.${className}.unpack(${serialized})).${methodName}(`
      );

      data.args.forEach((arg, index) => {
        if (index > 0) {
          wr.out(", ");
        }
        wr.out(serialize(arg));
      });
      wr.out(")))");

      const d = (() => {
        try {
          DecoratorTestSuite.isRecording = true;
          const value = method.apply(this, args);
          DecoratorTestSuite.isRecording = false;
          return value;
        } catch (e) {
          DecoratorTestSuite.isRecording = false;
          return null;
        }
      })();

      if (d && d.then) {
        d.then(resolvedData => {
          data.result = resolvedData;
          wr.out(`.to.deep.equal(${serialize(resolvedData)})`);
          wr.out(`})`, true);
        });
      } else {
        data.result = d;
        wr.out(`.to.deep.equal(${serialize(d)})`);
        wr.out(`})`, true);
      }

      DecoratorTestSuite.callCnt++;
      return d;
    };
    return propertyDesciptor;
  };
}
