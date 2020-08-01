import { Surrogate } from '../types';

/**
 * Internal Surrogate Event Handler
 *
 * @interface SurrogateEventHandler
 * @template T
 */
export interface SurrogateEventHandler<T extends object> {
  (method: string, ...args: any[]): Surrogate<T>;
}
