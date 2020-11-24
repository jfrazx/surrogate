import { manageDecorator, manageAsyncDecorator } from './manageDecorator';
import { SurrogateClassWrapper } from './surrogateClassWrapper';
import { SurrogateDelegateOptions } from './interfaces';
import { SurrogateOptions } from '../interfaces';
import { POST, PRE } from '../which';

export const SurrogateDelegate = (options: SurrogateOptions = {}) => {
  return <T extends Function>(klass: T) => {
    return SurrogateClassWrapper.wrap(klass, options);
  };
};

export const SurrogatePre = <T extends object>(options: SurrogateDelegateOptions<T>) => {
  return manageDecorator(PRE, options);
};

export const SurrogatePost = <T extends object>(options: SurrogateDelegateOptions<T>) => {
  return manageDecorator(POST, options);
};

export const SurrogateAsyncPost = <T extends object>(options: SurrogateDelegateOptions<T>) => {
  return manageAsyncDecorator(POST, options);
};

export const SurrogateAsyncPre = <T extends object>(options: SurrogateDelegateOptions<T>) => {
  return manageAsyncDecorator(PRE, options);
};
