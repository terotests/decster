import { serializerArguments } from "..";

export const testCaseSetup: serializerArguments = {
  enabled: true,
  firstCall: test => {
    // test.runner.testName
    // initialize the test function, import libraries etc.
    test.wr.out(`import { expect } from 'chai'`, true);
    test.wr.out(
      `import { Testing } from '../src/example/samplecode'  
      `,
      true
    );
    test.wr.tag("start");
    return test.wr;
  },
  arguments: test => {
    const wr = test.wr;
    test.args.forEach((arg, index) => {
      if (index > 0) {
        wr.out(", ");
      }
      wr.out(JSON.stringify(arg, null, 2));
    });
    wr.out("))", true);
  },
  wrapMethod: test => {
    // arguments for the test suite...
    test.wr.out(
      `test( "${test.className}.${test.methodName}", async () => {`,
      true
    );
    test.wr.indent(1);
    // create the class which is ready to be called
    test.wr.out(
      `expect( await (new ${test.className}()).${test.methodName}(`,
      true
    );
    const testcaseWriter = test.wr.fork();
    test.wr.indent(-1);
    test.wr.out(`})`, true);
    return testcaseWriter;
  },
  value: test => {
    test.wr.out(`.to.deep.equal(${JSON.stringify(test.result, null, 2)})`);
  }
};
