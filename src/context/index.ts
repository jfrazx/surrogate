import type { Surrogate, RequiredHandlerOptions, Contexts } from '../interfaces';
import { SurrogateContext } from '../constants';

export class Context<T extends object> {
  constructor(
    public readonly target: T,
    public readonly receiver: Surrogate<T>,
    public readonly event: string,
    public readonly original: Function,
    public readonly originalArguments: any[],
  ) {}

  determineContext(options: RequiredHandlerOptions<T>): Contexts {
    const { useContext } = options;

    return this.useInstance(useContext)
      ? this.target
      : this.useSurrogate(useContext)
      ? this.receiver
      : useContext;
  }

  useInstance(context: Contexts): boolean {
    return context === SurrogateContext.Instance;
  }

  useSurrogate(context: Contexts): boolean {
    return context === SurrogateContext.Surrogate;
  }
}
