import {
  MethodWrapper,
  SurrogateContext,
  SurrogateGlobalOptions,
  SurrogateHandlerOptions,
} from '../interfaces';

interface GlobalHandlerOptions<T extends object> {
  handler?: SurrogateHandlerOptions<T>;
  global?: SurrogateGlobalOptions;
}

const defaultMethodOptions: Required<SurrogateHandlerOptions<any>> = {
  priority: 0,
  noArgs: false,
  useNext: true,
  runOnBail: [],
  runOnError: [],
  runConditions: [],
  ignoreErrors: false,
  wrapper: MethodWrapper.Sync,
  useContext: SurrogateContext.Instance,
};

export interface OptionsHandler<T extends object>
  extends Required<SurrogateHandlerOptions<T>> {}

export class OptionsHandler<T extends object> {
  constructor(protected combinedOptions: GlobalHandlerOptions<T> = {}) {
    const options = this.mergeOptions(combinedOptions);

    Object.entries(options).forEach(([key, value]) => {
      Object.defineProperty(this, key, {
        enumerable: true,
        value,
      });
    });
  }

  private mergeOptions({
    handler = {},
    global = {},
  }: GlobalHandlerOptions<T>): Required<SurrogateHandlerOptions<T>> {
    return { ...defaultMethodOptions, ...global, ...handler };
  }
}
