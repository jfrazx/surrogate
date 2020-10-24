import { SurrogateDecoratorOptions, SurrogateDelegateOptions } from './interfaces';
import { SurrogateClassWrapper } from './surrogateClassWrapper';
import { asArray } from '@jfrazx/asarray';
import { isFunction } from '../helpers';
import { Which } from '../which';

export const manageDecorator = <T extends object>(
  type: Which,
  options: SurrogateDelegateOptions<T>,
) => {
  const decoratorOptions = organizeOptions(options);

  return (target: T, event: string) => {
    SurrogateClassWrapper.addDecorators(target.constructor, type, event, decoratorOptions);
  };
};

const organizeOptions = (options: SurrogateDelegateOptions<any>) => {
  return asArray(options)
    .map<SurrogateDecoratorOptions<any>[]>((value) => {
      if (isFunction(value)) {
        return [{ handler: value, options: {} }];
      }

      const { handler: handlers, options = {} } = value;

      return asArray(handlers).map((handler) => ({ handler, options }));
    })
    .reduce((acc, option) => [...acc, ...option], []);
};
