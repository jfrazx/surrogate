import { manageDecorator, determineWhich, manageAsyncDecorator } from './manageDecorator';
import { SurrogateDelegateOptions, SurrogateForOptions } from './interfaces';
import { SurrogateClassWrapper } from './surrogateClassWrapper';
import { SurrogateOptions } from '../interfaces';
import { POST, PRE, Which } from '../which';

export const SurrogateDelegate = (options: SurrogateOptions = {}) => {
  return <T extends Function>(klass: T) => {
    return SurrogateClassWrapper.wrap(klass, options);
  };
};

export const SurrogateFor = <T extends object>(forOptions: SurrogateForOptions<T>) => {
  const { type, options } = forOptions;
  const which: Which[] = determineWhich(type);

  return (target: T, event: keyof T) => {
    which.forEach((type) => manageDecorator(type, options)(target, event));
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
