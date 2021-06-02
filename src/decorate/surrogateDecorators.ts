import { manageDecorator, determineWhich, manageAsyncDecorator } from './manageDecorator';
import { SurrogateClassWrapper } from './surrogateClassWrapper';
import { POST, PRE, Which, BOTH } from '../which';
import { asArray } from '@jfrazx/asarray';
import {
  SurrogateForOptions,
  SurrogateDelegateOptions,
  SurrogateDecorateOptions,
} from './interfaces';

export const SurrogateDelegate =
  <T extends object>(options: SurrogateDecorateOptions<T> = {}) =>
  <K extends Function>(klass: K) =>
    SurrogateClassWrapper.wrap(klass, options);

export const SurrogateFor = <T extends object>(
  forOptions: SurrogateForOptions<T> | SurrogateForOptions<T>[],
) => {
  return (target: T, event: keyof T | string) => {
    asArray(forOptions).forEach((forOption) => {
      const { type, options } = forOption;
      const which: Which[] = determineWhich(type);

      which.forEach((type) => manageDecorator(type, options)(target, event));
    });
  };
};

export const SurrogatePreAndPost = <T extends object>(
  forOptions: SurrogateForOptions<T> | SurrogateForOptions<T>[],
) => {
  return (target: T, event: keyof T | string) => {
    asArray(forOptions).forEach((forOptions) =>
      SurrogateFor({
        ...forOptions,
        type: BOTH,
      })(target, event),
    );
  };
};

export const SurrogatePre = <T extends object>(
  preOptions: SurrogateDelegateOptions<T> | SurrogateDelegateOptions<T>[],
) => {
  const forOptions = asArray(preOptions).map<SurrogateForOptions<T>>((options) => ({
    options,
    type: PRE,
  }));

  return SurrogateFor(forOptions);
};

export const SurrogatePost = <T extends object>(
  postOptions: SurrogateDelegateOptions<T> | SurrogateDelegateOptions<T>[],
) => {
  const forOptions = asArray(postOptions).map<SurrogateForOptions<T>>((options) => ({
    options,
    type: POST,
  }));

  return SurrogateFor(forOptions);
};

export const SurrogateAsyncPost = <T extends object>(
  options: SurrogateDelegateOptions<T> | SurrogateDelegateOptions<T>[],
) => {
  return surrogateAsyncHelper(POST, options);
};

export const SurrogateAsyncPre = <T extends object>(
  options: SurrogateDelegateOptions<T> | SurrogateDelegateOptions<T>[],
) => {
  return surrogateAsyncHelper(PRE, options);
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
