import { SurrogateUnwrapped } from './surrogate';

export type SurrogateContexts = 'instance' | 'surrogate';
export type MethodWrappers = 'none' | 'async';

export enum SurrogateContext {
  Instance = 'instance',
  Surrogate = 'surrogate',
}

export enum MethodWrapper {
  None = 'none',
  Async = 'async',
}

export type RunCondition<T extends object> = (instance: SurrogateUnwrapped<T>) => boolean;

export interface SurrogateHandlerOptions<T extends object> {
  /**
   * Pass next object to the Surrogate Method
   *
   * @default true
   */
  useNext?: boolean;

  /**
   * If an error has been passed via next() and ignored, should the error be passed
   * to the next handler
   *
   * @default false
   */
  passErrors?: boolean;

  /**
   * Should errors be thrown or ignored when passed via next()?
   *
   * @default false
   */
  ignoreErrors?: boolean;

  /**
   * Pass the unwrapped instance to pre and post handlers
   *
   * @default false
   *
   * @note
   *    Handlers are called in the context (or receiver) of the instance, and the instance is attached to the NEXT object
   */
  passInstance?: boolean;

  /**
   * Pass the Surrogate wrapped instance to pre and post handlers
   *
   * @default false
   */
  passSurrogate?: boolean;

  /**
   * Specifies the context in which to call a handler
   *
   * @options
   *  - instance
   *  - surrogate
   *  - user supplied context object
   *
   * @default instance
   */
  useContext?: SurrogateContexts | typeof Object | typeof Function | Object;

  /**
   * @description Determines if the original method should be restored after running
   *
   * @default true
   */
  resetContext?: boolean;

  /**
   * Specifies the method context wrapper to utilize
   *
   * @options
   *  - none
   *  - async
   *
   * @default none
   */
  wrapper?: MethodWrappers;

  /**
   * Conditions to determine if a handler should be executed
   */
  runConditions?: RunCondition<T> | RunCondition<T>[];
}
