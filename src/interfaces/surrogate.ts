import { SurrogateEventManager } from './surrogateEventManager';
import { NextParameters } from './handlerOptions';

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
