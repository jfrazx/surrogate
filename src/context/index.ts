import { Surrogate, SurrogateContext, SurrogateHandlerOptions } from '../interfaces';

export class Context<T extends object> {
  constructor(
    public target: T,
    public receiver: Surrogate<T>,
    public event: string,
    public original: Function,
  ) {}

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
