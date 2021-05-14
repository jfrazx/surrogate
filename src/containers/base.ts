import { IContainer } from './interfaces';
import { WhichMethod } from '../which';
import {
  MethodWrapper,
  SurrogateContext,
  SurrogateHandler,
  SurrogateHandlerOptions,
} from '../interfaces';

const defaultMethodOptions: Required<SurrogateHandlerOptions<any>> = {
  useNext: true,
  runConditions: [],
  ignoreErrors: false,
  wrapper: MethodWrapper.Sync,
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
}
