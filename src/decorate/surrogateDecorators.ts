import { manageDecorator, determineWhich, manageAsyncDecorator } from './manageDecorator';
import { SurrogateClassWrapper } from './surrogateClassWrapper';
import { POST, PRE, Which, BOTH } from '../which';
import { asArray } from '@jfrazx/asarray';
import {
  SurrogateForOptions,
  SurrogateDelegateOptions,
  SurrogateDecorateOptions,
} from './interfaces';

type PropertyDecorator<T extends object> = (target: T, property: string | keyof T) => void;

/**
 * Register class for automatic surrogate wrapping
 *
 * @export
 * @decorator
 * @template T
 * @param {SurrogateDecorateOptions<T>} [delegateOptions={}]
 */
export const SurrogateDelegate =
  <T extends object>(delegateOptions: SurrogateDecorateOptions<T> = {}) =>
  <K extends Function>(klass: K) =>
    SurrogateClassWrapper.wrap(klass, delegateOptions);

/**
 * Registers hooks for decorated methods. Handler type must be assigned.
 *
 * @export
 * @decorator
 * @template T
 * @param {(SurrogateForOptions<T> | SurrogateForOptions<T>[])} forOptions
 * @returns {PropertyDecorator<T>}
 */
export const SurrogateFor = <T extends object>(
  forOptions: SurrogateForOptions<T> | SurrogateForOptions<T>[],
): PropertyDecorator<T> => {
  return (target: T, event: keyof T | string) => {
    asArray(forOptions).forEach((forOption) => {
      const { type, options } = forOption;
      const which: Which[] = determineWhich(type);

      which.forEach((type) => manageDecorator(type, options)(target, event));
    });
  };
};

/**
 * Registers pre and post hooks for decorated methods
 *
 * @export
 * @decorator
 * @template T
 * @param {(SurrogateDelegateOptions<T> | SurrogateDelegateOptions<T>[])} decoratorOptions
 * @returns {PropertyDecorator<T>}
 */
export const SurrogatePreAndPost = <T extends object>(
  decoratorOptions: SurrogateDelegateOptions<T> | SurrogateDelegateOptions<T>[],
): PropertyDecorator<T> => {
  return (target: T, event: keyof T | string) => {
    asArray(decoratorOptions).forEach((options) =>
      SurrogateFor({
        options,
        type: BOTH,
      })(target, event),
    );
  };
};

/**
 * Registers pre hooks for decorated methods
 *
 * @export
 * @decorator
 * @template T
 * @param {(SurrogateDelegateOptions<T> | SurrogateDelegateOptions<T>[])} decoratorOptions
 * @returns {PropertyDecorator<T>}
 */
export const SurrogatePre = <T extends object>(
  decoratorOptions: SurrogateDelegateOptions<T> | SurrogateDelegateOptions<T>[],
): PropertyDecorator<T> => {
  const forOptions = asArray(decoratorOptions).map<SurrogateForOptions<T>>((options) => ({
    options,
    type: PRE,
  }));

  return SurrogateFor(forOptions);
};

/**
 * Registers post hooks for decorated methods
 *
 * @export
 * @decorator
 * @template T
 * @param {(SurrogateDelegateOptions<T> | SurrogateDelegateOptions<T>[])} decoratorOptions
 * @returns {PropertyDecorator<T>}
 */
export const SurrogatePost = <T extends object>(
  decoratorOptions: SurrogateDelegateOptions<T> | SurrogateDelegateOptions<T>[],
): PropertyDecorator<T> => {
  const forOptions = asArray(decoratorOptions).map<SurrogateForOptions<T>>((options) => ({
    options,
    type: POST,
  }));

  return SurrogateFor(forOptions);
};

/**
 * Registers async pre and post hooks for decorated methods
 *
 * @export
 * @decorator
 * @template T
 * @param {(SurrogateDelegateOptions<T> | SurrogateDelegateOptions<T>[])} decoratorOptions
 * @returns {PropertyDecorator<T>}
 */
export const SurrogateAsyncPreAndPost = <T extends object>(
  decoratorOptions: SurrogateDelegateOptions<T> | SurrogateDelegateOptions<T>[],
): PropertyDecorator<T> => {
  const which: Which[] = [PRE, POST];

  return (target: T, event: keyof T | string) => {
    which.forEach((type) => surrogateAsyncHelper(type, decoratorOptions)(target, event));
  };
};

/**
 * Registers async post hooks for decorated methods
 *
 * @export
 * @decorator
 * @template T
 * @param {(SurrogateDelegateOptions<T> | SurrogateDelegateOptions<T>[])} decoratorOptions
 * @returns {PropertyDecorator<T>}
 */
export const SurrogateAsyncPost = <T extends object>(
  decoratorOptions: SurrogateDelegateOptions<T> | SurrogateDelegateOptions<T>[],
): PropertyDecorator<T> => {
  return surrogateAsyncHelper(POST, decoratorOptions);
};

/**
 * Registers async pre hooks for decorated methods
 *
 * @export
 * @decorator
 * @template T
 * @param {(SurrogateDelegateOptions<T> | SurrogateDelegateOptions<T>[])} decoratorOptions
 * @returns {PropertyDecorator<T>}
 */
export const SurrogateAsyncPre = <T extends object>(
  decoratorOptions: SurrogateDelegateOptions<T> | SurrogateDelegateOptions<T>[],
): PropertyDecorator<T> => {
  return surrogateAsyncHelper(PRE, decoratorOptions);
};

const surrogateAsyncHelper = <T extends object>(
  type: Which,
  asyncOptions: SurrogateDelegateOptions<T> | SurrogateDelegateOptions<T>[],
) => {
  return (target: T, event: keyof T | string) => {
    asArray(asyncOptions).forEach((options) => {
      manageAsyncDecorator(type, options)(target, event);
    });
  };
};
