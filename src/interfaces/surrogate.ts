import type { SurrogateEventManager } from './surrogateEventManager';
import type { NextParameters } from './handlerOptions';

export interface SurrogateMethods<T extends object> {
  disposeSurrogate(): T;
  getSurrogate(): SurrogateEventManager<T>;
  bypassSurrogate(): SurrogateUnwrapped<T>;
}

export type Surrogate<T extends object> = SurrogateMethods<T> & T;
export type SurrogateUnwrapped<T extends object> = Omit<
  Surrogate<T>,
  keyof SurrogateMethods<T>
>;

/**
 * @description Surrogate handler types
 */
export type SurrogateHandler<
  T extends object,
  Arguments extends Array<any> = any,
  Result = any,
> = (nextParameters?: NextParameters<T, Arguments, Result>) => unknown;

export type SurrogateHandlerTypes<
  T extends object,
  Arguments extends Array<any> = any,
  Result = any,
> = SurrogateHandler<T, Arguments, Result> | keyof T | string;

export type SurrogateHandlers<
  T extends object,
  Arguments extends Array<any> = any,
  Result = any,
> = SurrogateHandlerTypes<T, Arguments, Result> | SurrogateHandlerTypes<T>[];
