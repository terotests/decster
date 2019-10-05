import { TEST } from "..";
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

// testing a side effect
let globalState = 1;

export class Testing {
  user = {
    id: 1000
  };

  static resetState() {
    globalState = 1;
  }

  @TEST(testCaseSetup)
  helloWorld(cnt: number, text: string) {
    return `${text} : ${cnt}`;
  }

  @TEST(testCaseSetup)
  async timeout(ms: number, text: string) {
    await new Promise(resolve => setTimeout(resolve, ms));
    return [1, 2, 3, 4, text];
  }

  // runtime type checking for certain classes could be done here
  @TEST(testCaseSetup)
  method2(cnt: MoreComplexClass, text: string) {
    return `${text} : ${cnt.getCnt()}`;
  }

  @TEST(testCaseSetup)
  method3(cnt: MoreComplexClass, text: string) {
    return { count: cnt.a, text };
  }

  @TEST(testCaseSetup)
  mapItems(list: Array<{ name: string }>) {
    return list.map(item => {
      return {
        ucName: item.name.toLocaleUpperCase(),
        lcName: item.name.toLocaleLowerCase()
      };
    });
  }

  @TEST(testCaseSetup)
  incState() {
    return ++globalState;
  }

  @TEST({
    ...testCaseSetup,
    after: args => {
      args.wr.newline();
    }
  })
  decState() {
    return --globalState;
  }
}
