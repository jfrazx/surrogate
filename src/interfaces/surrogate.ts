import { SurrogateEventManager } from './surrogateEventManager';

export interface SurrogateMethods<T extends object> {
  disposeSurrogate(): SurrogateUnwrapped<T>;
  getSurrogate(): SurrogateEventManager<T>;
}

export type Surrogate<T extends object> = SurrogateMethods<T> & T;
export type SurrogateUnwrapped<T extends object> = Omit<
  Surrogate<T>,
  keyof SurrogateMethods<T>
>;
