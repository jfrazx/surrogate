import { isUndefined } from '../helpers';

export class MethodIdentifier<T extends object> {
  constructor(private instance: T) {}

  doesNotIncludeEvent(event: string, methods: string[]): boolean {
    return !this.doesIncludeEvent(event) || !this.matchEvent(event, methods);
  }

  doesIncludeEvent(event: string): boolean {
    return this.instanceMethodNames().includes(event);
  }

  private matchEvent(event: string, methods: string[]): boolean {
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

  instanceMethodNames(): string[] {
    const prototype = Reflect.getPrototypeOf(this.instance);
    const properties = this.getPropertyNames();

    return properties
      .filter((prop) => prop !== 'constructor')
      .filter((name) => this.isNotProperty(name))
      .filter((name) => this.isNotAccessor(name, prototype));
  }

  private isNotProperty(name: string): boolean {
    const descriptor = Reflect.getOwnPropertyDescriptor(this.instance, name);

    return isUndefined(descriptor);
  }

  private isNotAccessor(name: string, prototype: object): boolean {
    const descriptor = Reflect.getOwnPropertyDescriptor(prototype, name);

    return isUndefined(descriptor?.get) && isUndefined(descriptor?.set);
  }

  private getPropertyNames(): string[] {
    const props: string[][] = [];

    let current = this.instance as object;

    do {
      props.push(Object.getOwnPropertyNames(current));
    } while ((current = Reflect.getPrototypeOf(current)));

    return [...new Set(props.flat()).values()];
  }
}
