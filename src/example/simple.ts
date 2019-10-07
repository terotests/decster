import { TEST } from "..";

// how to serialize the objects for test cases
export const serializers = {
  HelloWorld: {
    pack: obj => ({ user: obj.user, msg: obj.message }),
    unpack: value => {
      const obj = new HelloWorld();
      obj.user = value.user;
      obj.message = value.msg;
      return obj;
    }
  }
};

export class HelloWorld {
  message = "Hello World";
  user = {
    id: 1000
  };

  @TEST(__filename)
  setMessage(value: string) {
    this.message = value;
  }
  @TEST(__filename)
  getMessage() {
    return this.message;
  }
  @TEST(__filename)
  getUser() {
    return this.user;
  }
  @TEST(__filename)
  setUserId(value: number) {
    this.user.id = value;
  }

  @TEST(__filename)
  recursive(msg: string) {
    this.setMessage(msg);
    return this.getMessage();
  }
}
