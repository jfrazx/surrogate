import { SurrogateOptions } from './interfaces';
import { SurrogateProxy } from './surrogate';
import { Surrogate } from './types';

/**
 * Simple function to create a Surrogate wrapped object
 *
 * @export
 * @template T
 * @param {T} object
 * @param {SurrogateOptions} [options={}]
 * @returns {Surrogate<T>}
 */
export function surrogateWrap<T extends object>(
  object: T,
  options: SurrogateOptions = {},
): Surrogate<T> {
  return SurrogateProxy.wrap(object, options);
}

export * from './surrogate';
export { Surrogate, SurrogateEvents } from './types';
