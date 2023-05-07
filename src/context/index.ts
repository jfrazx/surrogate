import type { Surrogate, SurrogateHandlerOptions, Contexts } from '../interfaces';
import { SurrogateContext } from '../constants';

export class Context<T extends object> {
  constructor(
    public target: T,
    public receiver: Surrogate<T>,
    public event: string,
    public original: Function,
    public originalArguments: any[],
  ) {}

  determineContext(options: SurrogateHandlerOptions<T>): Contexts {
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
