import { NextForOptions, NextDecoratorOptions } from './interfaces';
import { manageDecorator, determineWhich } from './manageDecorator';
import { MethodWrapper } from '../interfaces';
import { POST, PRE, Which } from '../which';
import { asArray } from '@jfrazx/asarray';

type PropertyDecorator<T extends object> = (
  target: T,
  property: string,
  descriptor: PropertyDescriptor,
) => void;

export const NextFor = <T extends object>(
  nextOptions: NextForOptions<T> | NextForOptions<T>[],
): PropertyDecorator<T> => {
  return (target: T, _event: string, descriptor: PropertyDescriptor): void => {
    asArray(nextOptions).forEach((nextOption) => {
      const { type, action, options } = nextOption;
      const which: Which[] = determineWhich(type);
      const actions = asArray(action);

      const { value: handler } = descriptor;

      which.forEach((type) =>
        actions.forEach((action) =>
          manageDecorator(type, { handler, options })(target, action),
        ),
      );
    });
  };
};

/**
 *
 * @decorator
 * @export
 * @template T
 * @param {NextDecoratorOptions<T>} {
 *   action,
 *   options = {},
 * }
 * @returns {PropertyDecorator<T>}
 */
export const NextAsyncPre = <T extends object>(
  asyncOptions: NextDecoratorOptions<T> | NextDecoratorOptions<T>[],
): PropertyDecorator<T> => {
  return nextAsyncHelper(asyncOptions, PRE);
};

/**
 *
 *
 * @export
 * @template T
 * @param {(NextDecoratorOptions<T> | NextDecoratorOptions<T>[])} asyncOptions
 * @returns {PropertyDecorator<T>}
 */
export function NextAsyncPost<T extends object>(
  asyncOptions: NextDecoratorOptions<T> | NextDecoratorOptions<T>[],
): PropertyDecorator<T> {
  return nextAsyncHelper(asyncOptions, POST);
}

/**
 *
 * @decorator
 * @export
 * @template T
 * @param {NextDecoratorOptions<T>} {
 *   action,
 *   options = {},
 * }
 * @returns {PropertyDecorator<T>}
 */
export const NextAsyncPreAndPost = <T extends object>(
  nextOptions: NextDecoratorOptions<T> | NextDecoratorOptions<T>[],
): PropertyDecorator<T> => {
  const which: Which[] = [PRE, POST];

  return (target: T, event: string, descriptor: PropertyDescriptor): void => {
    which.forEach((type) => nextAsyncHelper(nextOptions, type)(target, event, descriptor));
  };
};

const nextAsyncHelper = <T extends object>(
  asyncOptions: NextDecoratorOptions<T> | NextDecoratorOptions<T>[],
  type: Which,
): PropertyDecorator<T> => {
  return (target: T, event: string, descriptor: PropertyDescriptor): void =>
    asArray(asyncOptions).forEach(({ action, options }) =>
      NextFor({
        action,
        type,
        options: { ...options, wrapper: MethodWrapper.Async },
      })(target, event, descriptor),
    );
};

/**
 *
 * @decorator
 * @export
 * @template T
 * @param {NextDecoratorOptions<T>} {
 *   action,
 *   options = {},
 * }
 * @returns {PropertyDecorator<T>}
 */
export const NextPre = <T extends object>(
  nextOptions: NextDecoratorOptions<T> | NextDecoratorOptions<T>[],
): PropertyDecorator<T> => {
  return nextHelper<T>(nextOptions, PRE);
};

export const NextPost = <T extends object>(
  nextOptions: NextDecoratorOptions<T> | NextDecoratorOptions<T>[],
): PropertyDecorator<T> => {
  return nextHelper<T>(nextOptions, POST);
};

export const NextPreAndPost = <T extends object>(
  nextOptions: NextDecoratorOptions<T> | NextDecoratorOptions<T>[],
): PropertyDecorator<T> => {
  const which: Which[] = [PRE, POST];

  return (target: T, event: string, descriptor: PropertyDescriptor): void => {
    which.forEach((type) => nextHelper(nextOptions, type)(target, event, descriptor));
  };
};

const nextHelper = <T extends object>(
  hookOptions: NextDecoratorOptions<T> | NextDecoratorOptions<T>[],
  type: Which,
): PropertyDecorator<T> => {
  return (target: T, event: string, descriptor: PropertyDescriptor): void =>
    asArray(hookOptions).forEach(({ action, options }) =>
      NextFor({
        action,
        type,
        options,
      })(target, event, descriptor),
    );
};
