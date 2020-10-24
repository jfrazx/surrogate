import { SurrogateEventManager } from '../surrogate-event-manager';

/**
 * Custom type for WeakMap containing target object and any object method hooks
 *
 * @type Target
 */
export type Target<T extends object> = WeakMap<any, SurrogateEventManager<T>>;
