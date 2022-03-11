import { SurrogateHandlerOptions, MethodWrapper, SurrogateHandlerTypes } from '../interfaces';
import { SurrogateDecoratorOptions, SurrogateDelegateOptions } from './interfaces';
import { SurrogateClassWrapper } from './surrogateClassWrapper';
import { Which, Whichever, PRE, POST, BOTH } from '../which';
import { Constructor } from './interfaces';
import { asArray } from '@jfrazx/asarray';
import { isObject } from '../helpers';

export const manageDecorator = <T extends object>(
  type: Which,
  options: SurrogateDelegateOptions<T>,
) => {
  const decoratorOptions = organizeOptions<T>(options);

  return (target: T, event: keyof T | string) => {
    SurrogateClassWrapper.addDecorators(
      target.constructor as Constructor<T>,
      type,
      event as string,
      decoratorOptions,
    );
  };
};

export const determineWhich = (type: Whichever): Which[] =>
  type === BOTH ? [PRE, POST] : [type];

export const manageAsyncDecorator = <T extends object>(
  type: Which,
  options: SurrogateDelegateOptions<T>,
) => {
  const wrapper: SurrogateHandlerOptions<T> = { wrapper: MethodWrapper.Async };

  const asyncOptions = asArray(options).map<SurrogateDecoratorOptions<T>>((opt) =>
    isDecoratorOptions<T>(opt)
      ? { ...opt, options: { ...opt.options, ...wrapper } }
      : { handler: opt, options: { ...wrapper } },
  );

  return manageDecorator(type, asyncOptions);
};

const organizeOptions = <T extends object>(delegateOptions: SurrogateDelegateOptions<T>) => {
  return asArray(delegateOptions).flatMap<SurrogateDecoratorOptions<T>>(
    (value: SurrogateDecoratorOptions<T> | SurrogateHandlerTypes<T>) => {
      return isDecoratorOptions<T>(value)
        ? mapHandlers(value)
        : [{ handler: value, options: {} }];
    },
  );
};

const mapHandlers = <T extends object>(decoratorOptions: SurrogateDecoratorOptions<T>) => {
  const { handler: handlers, options = {} } = decoratorOptions;

  return asArray(handlers).map((handler) => ({ handler, options: { ...options } }));
};

const isDecoratorOptions = <T extends object>(
  value: any,
): value is SurrogateDecoratorOptions<T> => isObject(value);
