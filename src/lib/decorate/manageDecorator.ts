import { SurrogateDecoratorOptions, SurrogateDelegateOptions } from './interfaces';
import { SurrogateHandlerOptions, MethodWrapper } from '../interfaces';
import { SurrogateClassWrapper } from './surrogateClassWrapper';
import { Which, Whichever, PRE, POST, BOTH } from '../which';
import { asArray } from '@jfrazx/asarray';
import { isFunction } from '../helpers';

export const manageDecorator = <T extends object>(
  type: Which,
  options: SurrogateDelegateOptions<T>,
) => {
  const decoratorOptions = organizeOptions<T>(options);

  return (target: T, event: keyof T) => {
    SurrogateClassWrapper.addDecorators(target.constructor, type, event, decoratorOptions);
  };
};

export const determineWhich = (type: Whichever): Which[] =>
  type === BOTH ? [PRE, POST] : [type === PRE ? PRE : POST];

export const manageAsyncDecorator = <T extends object>(
  type: Which,
  options: SurrogateDelegateOptions<T>,
) => {
  const wrapper: SurrogateHandlerOptions<T> = { wrapper: MethodWrapper.Async };

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
