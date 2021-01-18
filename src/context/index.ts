import { Surrogate, SurrogateContext, SurrogateHandlerOptions } from '../interfaces';

export type BoundContext<T extends object> = () => Context<T>;

export class Context<T extends object> {
  constructor(
    public target: T,
    public receiver: Surrogate<T>,
    public event: string,
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

  determineContext(options: SurrogateHandlerOptions<T>): any {
    const { useContext } = options;

    return this.useInstance(useContext)
      ? this.target
      : this.useSurrogate(useContext)
      ? this.receiver
      : useContext;
  }

  private useInstance(context: SurrogateHandlerOptions<T>['useContext']) {
    return context === SurrogateContext.Instance;
  }

  private useSurrogate(context: SurrogateHandlerOptions<T>['useContext']) {
    return context === SurrogateContext.Surrogate;
  }
}
