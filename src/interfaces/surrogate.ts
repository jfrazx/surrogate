import { ISurrogateEventManager } from './surrogateEventManager';

export interface SurrogateMethods<T extends object> {
  getSurrogate(): ISurrogateEventManager<T>;
  disposeSurrogate(): SurrogateUnwrapped<T>;
}

export type Surrogate<T extends object> = SurrogateMethods<T> & T;
export type SurrogateUnwrapped<T extends object> = Omit<
  Surrogate<T>,
  keyof SurrogateMethods<T>
>;
