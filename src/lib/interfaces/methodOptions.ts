import { Unwrapped } from './surrogate';

export type MethodWrapper = 'none' | 'async';

export type RunCondition<T extends object> = (instance: Unwrapped<T>) => boolean;

export interface SurrogateMethodOptions<T extends object = any> {
  ignoreErrors?: boolean;
  passInstance?: boolean;
  runConditions?: RunCondition<T> | RunCondition<T>[];
}

export interface SurrogateMethodOptions<T extends object = any> {
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
  wrapper?: MethodWrapper;

  /**
   * Conditions to determine if a handler should be executed
   */
  runConditions?: RunCondition<T> | RunCondition<T>[];
}
