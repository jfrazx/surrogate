import { SurrogateEventManager } from '../surrogateEventManager';

/**
 * Interface containing Surrogate hooks
 *
 * @export
 * @interface Hooks
 * @template T
 */
export interface Hooks<T extends object> {
  getSurrogate(): SurrogateEventManager<T>;
}

export type Surrogate<T extends object> = Hooks<T> & T;
