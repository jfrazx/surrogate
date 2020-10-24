import { SurrogateEventManager } from '../surrogate-event-manager';

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
