import { SurrogateEventManager } from '../lib/surrogate-event-manager';

/**
 * Interface containing Surrogate hooks
 *
 * @export
 * @interface Hooks
 * @template T
 */
export interface Hooks<T> {
  getSurrogate(): SurrogateEventManager<T>;
}
