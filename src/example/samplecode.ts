import { TEST } from "..";

// how to serialize the objects for test cases
export const serializers = {
  MoreComplexClass: {
    pack: obj => obj.a,
    unpack: value => new MoreComplexClass(value)
  },
  Testing: {
    pack: obj => obj.user,
    unpack: value => {
      const obj = new Testing();
      obj.user = value;
      return obj;
    }
  }
};

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

  @TEST(__filename)
  helloWorld(cnt: number, text: string) {
    return `${text} : ${cnt}`;
  }

  @TEST(__filename)
  async timeout(ms: number, text: string) {
    await new Promise(resolve => setTimeout(resolve, ms));
    return [1, 2, 3, 4, text];
  }

  // runtime type checking for certain classes could be done here
  @TEST(__filename)
  method2(cnt: MoreComplexClass, text: string) {
    return `${text} : ${cnt.getCnt()}`;
  }

  @TEST(__filename)
  method3(cnt: MoreComplexClass, text: string) {
    return { count: cnt.a, text };
  }

  @TEST(__filename)
  mapItems(list: Array<{ name: string }>) {
    return list.map(item => {
      return {
        ucName: item.name.toLocaleUpperCase(),
        lcName: item.name.toLocaleLowerCase()
      };
    });
  }

  @TEST(__filename)
  incState() {
    return ++globalState;
  }

  @TEST(__filename)
  decState() {
    return --globalState;
  }
}
