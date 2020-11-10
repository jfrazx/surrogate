import { SurrogateDecoratorOptions, SurrogateDelegateOptions } from './interfaces';
import { SurrogateClassWrapper } from './surrogateClassWrapper';
import { SurrogateMethodOptions } from '../index';
import { asArray } from '@jfrazx/asarray';
import { isFunction } from '../helpers';
import { Which } from '../which';

export const manageDecorator = <T extends object>(
  type: Which,
  options: SurrogateDelegateOptions<T>,
) => {
  const decoratorOptions = organizeOptions<T>(options);

  return (target: T, event: string) => {
    SurrogateClassWrapper.addDecorators(target.constructor, type, event, decoratorOptions);
  };
};

export const manageAsyncDecorator = <T extends object>(
  type: Which,
  options: SurrogateDelegateOptions<T>,
) => {
  const wrapper: SurrogateMethodOptions<T> = { wrapper: 'async' };

  const asyncOptions = asArray(options).map<SurrogateDecoratorOptions<T>>((opt) =>
    isFunction(opt)
      ? { handler: opt, options: { ...wrapper } }
      : { ...opt, options: { ...opt.options, ...wrapper } },
  );

  return manageDecorator(type, asyncOptions);
};

const organizeOptions = <T extends object>(delegateOptions: SurrogateDelegateOptions<T>) => {
  return asArray(delegateOptions)
    .map<SurrogateDecoratorOptions<T>[]>((value) => {
      const mapHandlers = (decoratorOptions: SurrogateDecoratorOptions<T>) => {
        const { handler: handlers, options = {} } = decoratorOptions;

        return asArray(handlers).map((handler) => ({ handler, options }));
      };

      return isFunction(value) ? [{ handler: value, options: {} }] : mapHandlers(value);
    })
    .reduce((acc, option) => [...acc, ...option], []);
};
