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

export interface TestCaseOptions {
  name: string;
  description?: string;
  emitPath?: string;
  targetDir?: string;
  targetFile?: string;
  describeBlock?: () => [string, string];
  testBlock?: (info: MethodInfo) => [string, string];
}

export class TestCaseRunner {
  fs = new R.CodeFileSystem();
  isRunning = false;
  isRecording = false;
  callParams: { [key: string]: R.CodeWriter } = {};
  testName = "";
  callCnt = 0;
  emitPath = "dist";
  path = "test";
  filename = "";
  serializerCnt = 0;
  wr?: R.CodeWriter;
  options: TestCaseOptions;
  importedSerializers: { [key: string]: string } = {};

  uuCnt = 1;
  uniqueNames: { [key: string]: string } = {};

  getUniqueName(moduleName: string) {
    const trySimple = path.basename(moduleName);
    if (!this.uniqueNames[trySimple]) {
      this.uniqueNames[trySimple] = trySimple;
      return trySimple;
    }
    return this.getUniqueName(`module${this.uuCnt++}`);
  }

  async describe(
    opts: TestCaseOptions | string,
    runner: (runner: TestCaseRunner) => any
  ) {
    if (typeof opts === "string") {
      this.options = {
        name: opts
      };
    } else {
      this.options = opts;
    }
    const options = this.options;

    this.path = options.targetDir || this.path;
    this.filename = options.targetFile || `${options.name}.test.ts`;
    this.emitPath = options.emitPath || this.emitPath;
    const name = options.name;
    this.fs = new R.CodeFileSystem();
    this.start(name);

    // create a new test file writer for this test case, if it does not exist already
    this.wr = this.fs.getFile("/", this.filename).getWriter();
    if (this.wr.getCode().length === 0) {
      this.wr.out(`import { expect } from 'chai'`, true);
      // wr.out(`import { serializers } from '${relPath}'`, true);
      this.wr.tag("serializers"); // import serializers here
    }
    const wr = this.wr;
    const [describeBlockStart, describeBlockEnd] = options.describeBlock
      ? options.describeBlock()
      : [`describe("${options.description || name}", () => {`, `});`];
    wr.out(describeBlockStart, true);
    wr.indent(1);
    await runner(this);
    wr.indent(-1);
    wr.out(describeBlockEnd, true);
    this.end();
    this.fs.saveTo(this.path, { usePrettier: true });
    return this.fs;
  }

  private start(testName: string) {
    this.importedSerializers = {};
    this.isRunning = true;
    this.testName = testName;
    this.callCnt = 0;
    this.uniqueNames = {};
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
  disabled?: boolean;
  dirName?: string;
  fileName?: string;
}

export function TEST(__file: string, opts?: serializerArguments) {
  // if disabled, preserve original function
  if (opts && opts.disabled) {
    return function(
      target: Object,
      propertyName: string,
      propertyDesciptor: PropertyDescriptor
    ): PropertyDescriptor {
      return propertyDesciptor;
    };
  }
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
      throw `Modules which are to be tested must have serializers, problems with ${__file}`;
    }

    const serialize = (arg, serializerName: string) => {
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
        return `${serializerName}.${className}.unpack(${serialized})`;
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
        wr: DecoratorTestSuite.wr,
        self: this,
        args,
        className,
        methodName,
        runner: DecoratorTestSuite
      };

      // original:
      const relPath = path.relative(
        `./${DecoratorTestSuite.emitPath}/${DecoratorTestSuite.path}`,
        modPath
      );
      // const relPath = path.relative(__dirname, modPath);

      if (!DecoratorTestSuite.importedSerializers[relPath]) {
        const tag = data.wr.tag("serializers");

        DecoratorTestSuite.serializerCnt++;
        DecoratorTestSuite.importedSerializers[
          relPath
        ] = DecoratorTestSuite.getUniqueName(modPath);
        tag.out(
          `import * as ${
            DecoratorTestSuite.importedSerializers[relPath]
          } from '${relPath}'`,
          true
        );
      }
      const serializerName = `${
        DecoratorTestSuite.importedSerializers[relPath]
      }.serializers`;

      const [testBlockStart, testBlockEnd] = DecoratorTestSuite.options
        .testBlock
        ? DecoratorTestSuite.options.testBlock(data)
        : [`test( "${className}.${methodName}", async () => {`, `});`];

      const wr = data.wr;
      if (!mod.serializers[className]) {
        throw `class ${className} should have a serializer`;
      }
      wr.out(testBlockStart, true);
      wr.indent(1);

      const serialized = JSON.stringify(mod.serializers[className].pack(this));
      wr.out(
        `expect( await ((${serializerName}.${className}.unpack(${serialized})).${methodName}(`
      );

      data.args.forEach((arg, index) => {
        if (index > 0) {
          wr.out(", ");
        }
        wr.out(serialize(arg, serializerName));
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
          wr.out(`.to.deep.equal(${serialize(resolvedData, serializerName)})`);
          wr.out(testBlockEnd, true);
        });
      } else {
        data.result = d;
        wr.out(`.to.deep.equal(${serialize(d, serializerName)})`);
        wr.out(testBlockEnd, true);
      }

      DecoratorTestSuite.callCnt++;
      return d;
    };
    return propertyDesciptor;
  };
}
