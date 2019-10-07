import { TEST } from "..";

// each class in test case must have serializers defined
export const serializers = {
  Hello: {
    pack: obj => obj.message,
    unpack: value => new Hello(value)
  }
};

export class Hello {
  message = "Hello";
  constructor(message) {
    this.message = message;
  }
  @TEST(__filename)
  hello(name: string) {
    return `${this.message} ${name}`;
  }
}
