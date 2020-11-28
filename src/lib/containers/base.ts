import { IContainer } from './interfaces';
import { WhichMethod } from '../which';
import { Context } from '../context/index';
import {
  MethodWrapper,
  SurrogateContext,
  SurrogateHandler,
  SurrogateMethodOptions,
} from '../interfaces';

const defaultMethodOptions: Required<SurrogateMethodOptions<any>> = {
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
  public options: SurrogateMethodOptions<T>;

  constructor(
    public handler: SurrogateHandler<T> | Function,
    public type: WhichMethod,
    options: SurrogateMethodOptions<T> = {},
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
