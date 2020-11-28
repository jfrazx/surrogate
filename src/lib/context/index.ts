import { Property, Surrogate } from '../interfaces';

export type BoundContext<T extends object> = () => Context<T>;

export class Context<T extends object> {
  constructor(
    public target: T,
    public receiver: Surrogate<T>,
    public event: Property,
    public original: Function,
  ) {}

  static isAlreadyContextBound<T extends object>(
    original: Function,
  ): original is BoundContext<T> {
    return /^bound\sretrieveContext$/.test(original.name);
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
