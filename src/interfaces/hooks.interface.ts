import { SurrogateEvent, SurrogateCallback, Surrogate } from '../types';
import { SurrogateMethodOptions } from './method-options.interface';

/**
 * Interface containing Surrogate hooks
 *
 * @export
 * @interface Hooks
 * @template T
 */
export interface Hooks<T> {
  registerPreHook(
    event: SurrogateEvent,
    handler: SurrogateCallback | SurrogateCallback[],
    options?: SurrogateMethodOptions,
  ): Surrogate<T>;
  registerPostHook(
    event: SurrogateEvent,
    handler: SurrogateCallback | SurrogateCallback[],
    options?: SurrogateMethodOptions,
  ): Surrogate<T>;
  deregisterPreHook(
    event: SurrogateEvent,
    handler: SurrogateCallback | SurrogateCallback[],
  ): Surrogate<T>;
  deregisterPostHook(
    event: SurrogateEvent,
    handler: SurrogateCallback | SurrogateCallback[],
  ): Surrogate<T>;
  deregisterHooksFor(event: SurrogateEvent): Surrogate<T>;
}
