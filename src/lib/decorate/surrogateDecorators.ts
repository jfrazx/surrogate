import { SurrogateClassWrapper } from './surrogateClassWrapper';
import { SurrogateDelegateOptions } from './interfaces';
import { manageDecorator } from './manageDecorator';
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
