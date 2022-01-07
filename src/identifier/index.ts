import { isFunction } from '../helpers';

export class MethodIdentifier<T extends object> {
  constructor(private instance: T) {}

  doesNotIncludeEvent(event: string, methods: string[]): boolean {
    const properties = this.instancePropertyNames();

    return properties.includes(event) ? !this.includesEvent(event, methods) : true;
  }

  private includesEvent(event: string, methods: string[]): boolean {
    return methods
      .filter((v) => v)
      .map((method) => new RegExp(method))
      .some((regex) => regex.test(event));
  }

  getApplicableMethods(event: string, methods: string[]): string[] {
    const methodTest = new RegExp(event);

    return methods.includes(event)
      ? [event]
      : methods.filter((method) => methodTest.test(method));
  }

  instancePropertyNames(): string[] {
    const properties = this.getPropertyNames();

    return properties
      .filter((prop) => prop !== 'constructor')
      .filter((name) => isFunction(Reflect.get(this.instance, name)));
  }

  private getPropertyNames(): string[] {
    const objectProto = Object.getPrototypeOf({});
    const props: string[][] = [];
    let current = this.instance;

    do {
      props.push(Object.getOwnPropertyNames(current));
    } while (
      Object.getPrototypeOf(current) !== objectProto &&
      (current = Object.getPrototypeOf(current))
    );

    return [...new Set(props.flatMap((p) => p)).values()];
  }
}
