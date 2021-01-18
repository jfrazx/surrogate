import { manageDecorator, determineWhich } from './manageDecorator';
import { NextForOptions, NextHookOptions } from './interfaces';
import { MethodWrapper } from '../interfaces';
import { POST, PRE, Which } from '../which';
import { asArray } from '@jfrazx/asarray';

type PropertyDecorator<T extends object> = (
  target: T,
  property: string,
  descriptor: PropertyDescriptor,
) => void;

export const NextFor = <T extends object>(
  nextOptions: NextForOptions<T>,
): PropertyDecorator<T> => {
  const { type, action, options } = nextOptions;
  const which: Which[] = determineWhich(type);
  const actions = asArray(action);

  return (target: T, _event: string, descriptor: PropertyDescriptor): void => {
    const { value: handler } = descriptor;

    which.forEach((type) =>
      actions.forEach((action) => manageDecorator(type, { handler, options })(target, action)),
    );
  };
};

/**
 *
 * @decorator
 * @export
 * @template T
 * @param {NextHookOptions<T>} {
 *   action,
 *   options = {},
 * }
 * @returns {PropertyDecorator<T>}
 */
export const NextAsyncPre = <T extends object>({
  action,
  options = {},
}: NextHookOptions<T>): PropertyDecorator<T> => {
  return NextFor({
    action,
    type: PRE,
    options: { ...options, wrapper: MethodWrapper.Async },
  });
};

export const NextAsyncPost = <T extends object>({
  action,
  options = {},
}: NextHookOptions<T>): PropertyDecorator<T> => {
  return NextFor({
    action,
    type: POST,
    options: { ...options, wrapper: MethodWrapper.Async },
  });
};

export const NextPre = <T extends object>(
  nextOptions: NextHookOptions<T>,
): PropertyDecorator<T> => {
  return NextFor<T>({ ...nextOptions, type: PRE });
};
export const NextPost = <T extends object>(
  nextOptions: NextHookOptions<T>,
): PropertyDecorator<T> => {
  return NextFor<T>({ ...nextOptions, type: POST });
};
