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
export type SurrogateHandler<T extends object> = (
  nextParameters?: NextParameters<T>,
) => unknown;

export type SurrogateHandlerTypes<T extends object> = SurrogateHandler<T> | keyof T | string;

export type SurrogateHandlers<T extends object> =
  | SurrogateHandlerTypes<T>
  | SurrogateHandlerTypes<T>[];
