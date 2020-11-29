import { IContainer } from './interfaces';
import { WhichMethod } from '../which';
import { Context } from '../context';
import {
  MethodWrapper,
  SurrogateContext,
  SurrogateHandler,
  SurrogateHandlerOptions,
} from '../interfaces';

const defaultMethodOptions: Required<SurrogateHandlerOptions<any>> = {
  useNext: true,
  passErrors: false,
  runConditions: [],
  ignoreErrors: false,
  passInstance: false,
  passSurrogate: false,
  wrapper: MethodWrapper.None,
  useContext: SurrogateContext.Instance,
};

export abstract class BaseContainer<T extends object> implements IContainer<T> {
  public options: SurrogateHandlerOptions<T>;

  constructor(
    public handler: SurrogateHandler<T> | Function,
    public type: WhichMethod,
    options: SurrogateHandlerOptions<T> = {},
  ) {
    this.options = { ...defaultMethodOptions, ...options };
  }

  determineContext(context: Context<T>): any {
    const { useContext } = this.options;

    return this.useInstance()
      ? context.target
      : this.useSurrogate()
      ? context.receiver
      : useContext;
  }

  private useInstance() {
    const { useContext } = this.options;

    return useContext === SurrogateContext.Instance;
  }

  private useSurrogate() {
    const { useContext } = this.options;

    return useContext === SurrogateContext.Surrogate;
  }
}
