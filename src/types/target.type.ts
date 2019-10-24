import { IEvent } from '../interfaces';

/**
 * Custom type for WeakMap containing target object and any object method hooks
 *
 * @type Target
 */
export type Target = WeakMap<any, IEvent>;
