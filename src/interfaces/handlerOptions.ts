import { SurrogateUnwrapped, Surrogate } from './surrogate';
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

export interface NextHandler<T extends object> {
  instance: SurrogateUnwrapped<T>;
  surrogate: Surrogate<T>;
  originalArgs: any[];
  receivedArgs: any[];
  hookType: string;
  action: string;
  error?: Error;
  next: INext;
}

export interface RunConditionParameters<T extends object> {
  instance: SurrogateUnwrapped<T>;
  originalArgs: any[];
  receivedArgs: any[];
  didError: boolean;
  action: string;
  error?: Error;
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
