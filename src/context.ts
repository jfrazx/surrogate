import { Surrogate, Property, BoundContext } from './types';

export class Context<T extends object> {
  constructor(
    public target: T,
    public event: Property,
    public original: Function,
    public receiver: Surrogate<T>,
  ) {}

  static isAlreadyContextBound(original: Function): original is BoundContext<any> {
    return /^bound\s\S+$/.test(original.name);
  }

  createRetrievableContext() {
    const bound = this.retrieveContext.bind(this);

    Reflect.set(this.target, this.event, bound);

    return bound;
  }

  retrieveContext(): Context<T> {
    return this;
  }

  resetContext(): void {
    Reflect.set(this.target, this.event, this.original);
  }
}
