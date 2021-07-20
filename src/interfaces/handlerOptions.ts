import { SurrogateUnwrapped, Surrogate } from './surrogate';
import { TimeTracker } from '../timeTracker';
import { INext } from '../next';

export type SurrogateContexts = 'instance' | 'surrogate';
export type MethodWrappers = 'sync' | 'async';

export type Contexts = SurrogateContexts | typeof Object | typeof Function | Object;

export enum SurrogateContext {
  Instance = 'instance',
  Surrogate = 'surrogate',
}

export enum MethodWrapper {
  Sync = 'sync',
  Async = 'async',
}

export enum HookType {
  PRE = 'pre',
  POST = 'post',
  BOTH = 'both',
}

export interface NextHandler<T extends object> extends ActionParameters<T> {
  timeTracker: TimeTracker;
  surrogate: Surrogate<T>;
  currentArgs: any[];
  hookType: string;
  result: any;
  next: INext;
}

interface ActionParameters<T extends object> {
  instance: SurrogateUnwrapped<T>;
  originalArgs: any[];
  receivedArgs: any[];
  action: string;
  error?: Error;
}

export interface RunConditionParameters<T extends object> extends ActionParameters<T> {
  didError: boolean;
}

export type RunCondition<T extends object> = (
  parameters: RunConditionParameters<T>,
) => boolean;

export interface SurrogateHandlerOptions<T extends object> {
  /**
   * @description Pass Next object to the Surrogate Method
   *
   * @default true
   */
  useNext?: boolean;

  /**
   * @description Specify that nothing should be passed to handler
   *
   * @default false
   */
  noArgs?: boolean;

  /**
   * @description Should errors be thrown or ignored when passed via next()?
   *
   * @default false
   */
  ignoreErrors?: boolean;

  /**
   * @description Specifies the context in which to call a handler
   *
   * @options
   *  - instance
   *  - surrogate
   *  - user supplied context object
   *
   * @default instance
   */
  useContext?: Contexts;

  /**
   * @description Specifies the method context wrapper to utilize
   *
   * @options
   *  - none
   *  - async
   *
   * @default none
   */
  wrapper?: MethodWrappers;

  /**
   * @description Conditions to determine if a handler should be executed
   */
  runConditions?: RunCondition<T> | RunCondition<T>[];
}
