import { SurrogateEventManager } from '../manager';

export interface GetSurrogate<T extends object> {
  getSurrogate(): SurrogateEventManager<T>;
}

export type Surrogate<T extends object> = GetSurrogate<T> & T;
export type Unwrapped<T extends object> = Omit<Surrogate<T>, keyof GetSurrogate<T>>;
