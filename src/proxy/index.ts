import { Surrogate, SurrogateOptions } from '../interfaces';
import { SurrogateProxy } from './handler';

/**
 * Helper function to create Surrogate wrapped objects
 *
 * @export
 * @template T
 * @param {T} object
 * @param {SurrogateOptions} [options={}]
 * @returns {Surrogate<T>}
 */
export const wrapSurrogate = <T extends object>(
  object: T,
  options: SurrogateOptions = {},
): Surrogate<T> => SurrogateProxy.wrap(object, options);

export * from './handler';
