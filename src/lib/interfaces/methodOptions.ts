import { Unwrapped } from './surrogate';

export type MethodWrappers = 'none' | 'async';

export enum MethodWrapper {
  None = 'none',
  Async = 'async',
}

export type RunCondition<T extends object> = (instance: Unwrapped<T>) => boolean;

export interface SurrogateMethodOptions<T extends object> {
  /**
   * Pass next object to the Surrogate Method
   */
  useNext?: boolean;

  /**
   * If an error has been passed via next() should the error be passed
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
  passInstance?: boolean;
  wrapper?: MethodWrappers;

  /**
   * Conditions to determine if a handler should be executed
   */
  runConditions?: RunCondition<T> | RunCondition<T>[];
}
