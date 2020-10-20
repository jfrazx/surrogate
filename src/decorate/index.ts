import { SurrogateClassWrapper } from './surrogateClassWrapper';
import { SurrogateOptions } from '../interfaces';

export const SurrogateDelegate = (options: SurrogateOptions = {}) => {
  return <T extends Function>(klass: T) => {
    return SurrogateClassWrapper.wrap(klass, options);
  };
};
