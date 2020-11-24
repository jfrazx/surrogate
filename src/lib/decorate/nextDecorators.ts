import { NextForOptions, NextHookOptions } from './interfaces';
import { POST, PRE, BOTH, Which, Whichever } from '../which';
import { MethodWrapper } from '../interfaces/methodOptions';
import { manageDecorator } from './manageDecorator';
import { asArray } from '@jfrazx/asarray';

export const NextFor = <T extends object>(nextOptions: NextForOptions<T>) => {
  const { type, action, options } = nextOptions;
  const which: Which[] = determineWhich(type);
  const actions = asArray(action);

  return (target: T, _event: string, descriptor: PropertyDescriptor) => {
    const { value: handler } = descriptor;

    which.forEach((type) =>
      actions.forEach((action) => manageDecorator(type, { handler, options })(target, action)),
    );
  };
};

export const NextAsyncPre = <T extends object>({
  action,
  options = {},
}: NextHookOptions<T>) => {
  return NextFor({
    action,
    type: PRE,
    options: { ...options, wrapper: MethodWrapper.Async },
  });
};

export const NextAsyncPost = <T extends object>({
  action,
  options = {},
}: NextHookOptions<T>) => {
  return NextFor({
    action,
    type: POST,
    options: { ...options, wrapper: MethodWrapper.Async },
  });
};

export const NextPre = <T extends object>(nextOptions: NextHookOptions<T>) => {
  return NextFor<T>({ ...nextOptions, type: PRE });
};
export const NextPost = <T extends object>(nextOptions: NextHookOptions<T>) => {
  return NextFor<T>({ ...nextOptions, type: POST });
};

const determineWhich = (type: Whichever): Which[] =>
  type === BOTH ? [PRE, POST] : [type === PRE ? PRE : POST];
