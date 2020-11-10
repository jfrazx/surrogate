import { manageDecorator, manageAsyncDecorator } from './manageDecorator';
import { SurrogateClassWrapper } from './surrogateClassWrapper';
import { SurrogateDelegateOptions } from './interfaces';
import { SurrogateOptions } from '../interfaces';
import { POST_HOOK, PRE_HOOK } from '../which';

export const SurrogateDelegate = (options: SurrogateOptions = {}) => {
  return <T extends Function>(klass: T) => {
    return SurrogateClassWrapper.wrap(klass, options);
  };
};

export const SurrogatePre = <T extends object>(options: SurrogateDelegateOptions<T>) => {
  return manageDecorator(PRE_HOOK, options);
};

export const SurrogatePost = <T extends object>(options: SurrogateDelegateOptions<T>) => {
  return manageDecorator(POST_HOOK, options);
};

export const SurrogateAsyncPost = <T extends object>(options: SurrogateDelegateOptions<T>) => {
  return manageAsyncDecorator(POST_HOOK, options);
};

export const SurrogateAsyncPre = <T extends object>(options: SurrogateDelegateOptions<T>) => {
  return manageAsyncDecorator(PRE_HOOK, options);
};
