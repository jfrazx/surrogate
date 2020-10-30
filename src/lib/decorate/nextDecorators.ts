import { NextForOptions, NextHookOptions } from './interfaces';
import { manageDecorator } from './manageDecorator';
import { POST_HOOK, PRE_HOOK } from '../which';

export const NextFor = <T extends object>(nextOptions: NextForOptions<T>) => {
  const { type, action, options } = nextOptions;

  return (target: T, _event: string, descriptor: PropertyDescriptor) => {
    const { value: handler } = descriptor;

    manageDecorator(type, { handler, options })(target, action);
  };
};

export const NextPre = <T extends object>(nextOptions: NextHookOptions<T>) => {
  return NextFor<T>({ ...nextOptions, type: PRE_HOOK });
};
export const NextPost = <T extends object>(nextOptions: NextHookOptions<T>) => {
  return NextFor<T>({ ...nextOptions, type: POST_HOOK });
};
