import { serializerArguments } from "..";

export const testCaseSetup: serializerArguments = {
  firstCall: args => {
    // args.runner.testName
    // initialize the test function, import libraries etc.
    args.wr.out(`import { expect } from 'chai'`, true);
    args.wr.out(
      `import { Testing, MoreComplexClass } from '../src/example/samplecode'
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
