import { TEST } from "..";

export const serializers = {
  ClassWithoutDecorator: {
    pack: value => null,
    unpack: value => new ClassWithoutDecorator()
  },
  AnotherClassWithDecorator: {
    pack: value => null,
    unpack: value => new AnotherClassWithDecorator()
  }
};

export class ClassWithoutDecorator {
  @TEST(__filename, { disabled: true })
  name() {
    return "name";
  }
}

export class AnotherClassWithDecorator {
  @TEST(__filename, { disabled: false })
  name() {
    return "name";
  }
}
