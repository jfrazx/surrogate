import { POST_HOOK, PRE_HOOK, BOTH, Which, Whichever } from '../which';
import { NextForOptions, NextHookOptions } from './interfaces';
import { manageDecorator } from './manageDecorator';

export const NextFor = <T extends object>(nextOptions: NextForOptions<T>) => {
  const { type, action, options } = nextOptions;
  const which: Which[] = determineWhich(type);

  return (target: T, _event: string, descriptor: PropertyDescriptor) => {
    const { value: handler } = descriptor;

    which.forEach((type) => manageDecorator(type, { handler, options })(target, action));
  };
};

export const NextPre = <T extends object>(nextOptions: NextHookOptions<T>) => {
  return NextFor<T>({ ...nextOptions, type: PRE_HOOK });
};
export const NextPost = <T extends object>(nextOptions: NextHookOptions<T>) => {
  return NextFor<T>({ ...nextOptions, type: POST_HOOK });
};

const determineWhich = (type: Whichever): Which[] =>
  type === BOTH ? [PRE_HOOK, POST_HOOK] : [type === PRE_HOOK ? PRE_HOOK : POST_HOOK];
