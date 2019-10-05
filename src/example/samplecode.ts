import { testParams } from "..";
import { testCaseSetup } from "./setup";

export class MoreComplexClass {
  a = 0;
  constructor(a: number) {
    this.a = a;
  }
  getCnt() {
    return this.a;
  }
}

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
