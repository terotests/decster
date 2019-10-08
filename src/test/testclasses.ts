import { TEST } from "..";

export const serializers = {
  ClassWithDecorator: {
    pack: value => null,
    unpack: value => new ClassWithDecorator()
  }
};

export class ClassWithDecorator {
  @TEST(__filename, { disabled: false })
  name() {
    return "name";
  }
}
