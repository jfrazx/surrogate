import { Container, ContainerGenerator } from '../container';
import { SurrogateMethodOptions } from '../interfaces';
import { SurrogateProxy } from '../surrogate-proxy';
import { INext, NextOptions } from './interfaces';
import { Context } from '../context';

const defaultErrorOptions: SurrogateMethodOptions = {
  passErrors: false,
  ignoreErrors: false,
  passInstance: false,
};

export abstract class BaseNext<T extends object> implements INext<T> {
  protected _next: INext<T> = null;

  constructor(
    protected proxy: SurrogateProxy<T>,
    public context: Context<T>,
    protected iterator: Generator<Container<T>, Container<T>, ContainerGenerator>,
    protected container: Container<T>,
  ) {}

  static for(
    proxy: SurrogateProxy<any>,
    context: Context<any>,
    iterator: Generator<Container, Container, ContainerGenerator>,
  ): INext<any> {
    const { value, done } = iterator.next();

    return done
      ? new FinalNext(proxy, context, iterator, value)
      : new Next(proxy, context, iterator, value);
  }

  skip(times: number = 1): void {
    return this.skipWith(times);
  }

  nextError(error: Error, ...args: any[]) {
    const { options } = this.container;
    const useOptions = { ...defaultErrorOptions, ...options };
    const useArgs = this.determineErrorArgs(useOptions, error, args);

    if (useOptions.ignoreErrors) {
      return this.next({ error: null, using: useArgs });
    }

    this.iterator.throw(error);
  }

  protected determineErrorArgs(
    { passErrors, passInstance }: SurrogateMethodOptions,
    error: Error,
    args: any[],
  ) {
    if (passErrors) {
      if (passInstance) {
        args.unshift(this.instance);
      }
      args.unshift(error);
    }

    return args;
  }

  get instance(): T {
    return this.context.target;
  }

  abstract skipWith(times?: number, ...args: any[]): void;
  abstract next(options?: NextOptions): void;
}

import { Next } from './next';
import { FinalNext } from './final-next';
