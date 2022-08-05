import {
  MethodWrapper,
  SurrogateContext,
  SurrogateOptions,
  SurrogateHandlerOptions,
} from '../../interfaces';

export const defaultMethodOptions: Required<SurrogateHandlerOptions<any>> = {
  priority: 0,
  noArgs: false,
  useNext: true,
  provide: null,
  runOnBail: [],
  runOnError: [],
  runConditions: [],
  ignoreErrors: false,
  silenceErrors: false,
  wrapper: MethodWrapper.Sync,
  useContext: SurrogateContext.Instance,
};

export const defaultGlobalOptions: Required<
  Omit<Omit<SurrogateOptions, 'useSingleton'>, keyof SurrogateHandlerOptions<any>>
> = {
  maintainContext: false,
};
