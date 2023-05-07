import type { NextForOptions, NextDecoratorOptions, Action } from './interfaces';
import { manageDecorator, determineWhich } from './manageDecorator';
import { MethodWrapper } from '../constants';
import { POST, PRE, Which } from '../which';
import { asArray } from '@jfrazx/asarray';

type PropertyDecorator<T extends object> = (
  target: T,
  property: string,
  descriptor: PropertyDescriptor,
) => void;

/**
 * @description Designate decorated methods as next handler. Handler type must be assigned
 *
 * @export
 * @decorator
 * @template T
 * @param {(NextForOptions<T> | NextForOptions<T>[])} nextOptions
 * @returns {PropertyDecorator<T>}
 */
export const NextFor =
  <T extends object>(
    nextOptions: NextForOptions<T> | NextForOptions<T>[],
  ): PropertyDecorator<T> =>
  (target: T, event: string): void =>
    asArray(nextOptions).forEach((nextOption: NextForOptions<T>) => {
      const { type, action, options } = nextOption;
      const which: Which[] = determineWhich(type);
      const actions: Action<T>[] = asArray(action);

      which.forEach((type: Which) =>
        actions.forEach((action: Action<T>) =>
          manageDecorator<T>(type, {
            handler: event,
            options,
          })(target, action),
        ),
      );
    });

/**
 * Designate decorated methods as async pre hooks.
 *
 * @export
 * @decorator
 * @template T
 * @param {(NextDecoratorOptions<T> | NextDecoratorOptions<T>[])} nextOptions
 * @returns {PropertyDecorator<T>}
 */
export const NextAsyncPre = <T extends object>(
  nextOptions: NextDecoratorOptions<T> | NextDecoratorOptions<T>[],
): PropertyDecorator<T> => {
  return nextAsyncHelper(nextOptions, PRE);
};

/**
 * Designate decorated methods as async post hooks.
 *
 * @export
 * @decorator
 * @template T
 * @param {(NextDecoratorOptions<T> | NextDecoratorOptions<T>[])} nextOptions
 * @returns {PropertyDecorator<T>}
 */
export const NextAsyncPost = <T extends object>(
  nextOptions: NextDecoratorOptions<T> | NextDecoratorOptions<T>[],
): PropertyDecorator<T> => {
  return nextAsyncHelper(nextOptions, POST);
};

/**
 * Designate decorated methods as async pre and post hooks.
 *
 * @export
 * @decorator
 * @template T
 * @param {(NextDecoratorOptions<T> | NextDecoratorOptions<T>[])} nextOptions
 * @returns {PropertyDecorator<T>}
 */
export const NextAsyncPreAndPost = <T extends object>(
  nextOptions: NextDecoratorOptions<T> | NextDecoratorOptions<T>[],
): PropertyDecorator<T> => {
  const which: Which[] = [PRE, POST];

  return (target: T, event: string, descriptor: PropertyDescriptor): void => {
    which.forEach((type: Which) =>
      nextAsyncHelper(nextOptions, type)(target, event, descriptor),
    );
  };
};

const nextAsyncHelper = <T extends object>(
  nextOptions: NextDecoratorOptions<T> | NextDecoratorOptions<T>[],
  type: Which,
): PropertyDecorator<T> => {
  return (target: T, event: string, descriptor: PropertyDescriptor): void =>
    asArray(nextOptions).forEach(({ action, options }: NextDecoratorOptions<T>) =>
      nextHelper<T>(
        {
          action,
          options: { ...options, wrapper: MethodWrapper.Async },
        },
        type,
      )(target, event, descriptor),
    );
};

/**
 * Designate decorated methods as pre hooks.
 *
 * @export
 * @decorator
 * @template T
 * @param {(NextDecoratorOptions<T> | NextDecoratorOptions<T>[])} nextOptions
 * @returns {PropertyDecorator<T>}
 */
export const NextPre = <T extends object>(
  nextOptions: NextDecoratorOptions<T> | NextDecoratorOptions<T>[],
): PropertyDecorator<T> => {
  return nextHelper<T>(nextOptions, PRE);
};

/**
 * Designate decorated methods as post hook
 *
 * @export
 * @decorator
 * @template T
 * @param {(NextDecoratorOptions<T> | NextDecoratorOptions<T>[])} nextOptions
 * @returns {PropertyDecorator<T>}
 */
export const NextPost = <T extends object>(
  nextOptions: NextDecoratorOptions<T> | NextDecoratorOptions<T>[],
): PropertyDecorator<T> => {
  return nextHelper<T>(nextOptions, POST);
};

/**
 * Designate decorated methods as pre and post hooks.
 *
 * @export
 * @decorator
 * @template T
 * @param {(NextDecoratorOptions<T> | NextDecoratorOptions<T>[])} nextOptions
 * @returns {PropertyDecorator<T>}
 */
export const NextPreAndPost = <T extends object>(
  nextOptions: NextDecoratorOptions<T> | NextDecoratorOptions<T>[],
): PropertyDecorator<T> => {
  const which: Which[] = [PRE, POST];

  return (target: T, event: string, descriptor: PropertyDescriptor): void => {
    which.forEach((type) => nextHelper<T>(nextOptions, type)(target, event, descriptor));
  };
};

const nextHelper = <T extends object>(
  hookOptions: NextDecoratorOptions<T> | NextDecoratorOptions<T>[],
  type: Which,
): PropertyDecorator<T> => {
  return (target: T, event: string, descriptor: PropertyDescriptor): void =>
    asArray(hookOptions).forEach(({ action, options }: NextDecoratorOptions<T>) =>
      NextFor<T>({
        action,
        type,
        options,
      })(target, event, descriptor),
    );
};
