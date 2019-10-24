import { Surrogate } from '../types';

/**
 * Internal Surrogate Event Handler
 *
 * @interface SurrogateEventHandler
 * @template T
 */
export interface SurrogateEventHandler<T> {
  (method: string, ...args: any[]): Surrogate<T>;
}
