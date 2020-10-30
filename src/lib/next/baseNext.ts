import { Container, ContainerGenerator } from '../container';
import { SurrogateMethodOptions } from '../interfaces';
import { SurrogateProxy } from '../surrogateProxy';
import { INext, NextOptions } from './interfaces';
import { Unwrapped } from '../interfaces/hooks';
import { asArray } from '@jfrazx/asarray';
import { Context } from '../context';
import { Which } from '../which';

const defaultErrorOptions: SurrogateMethodOptions = {
  passErrors: false,
  ignoreErrors: false,
  passInstance: false,
};

const nextOptionDefaults: NextOptions = {
  error: null,
  using: [],
  bail: false,
};

export abstract class BaseNext<T extends object> implements INext<T> {
  protected _next: INext<T> = null;
  public didBail = false;

  constructor(
    protected proxy: SurrogateProxy<T>,
    public context: Context<T>,
    protected type: Which,
    protected iterator: Generator<Container<T>, Container<T>, ContainerGenerator>,
    protected container: Container<T>,
  ) {}

  static for(
    proxy: SurrogateProxy<any>,
    context: Context<any>,
    type: Which,
    iterator: Generator<Container, Container, ContainerGenerator>,
  ): INext<any> {
    const { value, done } = iterator.next();

    return done
      ? new FinalNext(proxy, context, type, iterator, value)
      : new Next(proxy, context, type, iterator, value);
  }

  skip(times: number = 1): void {
    return this.skipWith(times);
  }

  nextError(error: Error, ...args: any[]) {
    const { options } = this.container;
    const useOptions = { ...defaultErrorOptions, ...options };
    const useArgs = this.determineErrorArgs(useOptions, error, args);

    if (useOptions.ignoreErrors) {
      return this.next({
        error: null,
        using: useArgs,
        bail: this.didBail,
      });
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

  protected shouldRun(): boolean {
    const { options } = this.container;
    const instance = this.instance;

    return asArray(options.runConditions).every((condition) =>
      condition.call(instance, instance),
    );
  }

  get instance(): Unwrapped<T> {
    return this.context.target;
  }

  next(nextOptions: NextOptions = {}): void {
    const useNextOptions = { ...nextOptionDefaults, ...nextOptions };
    const { error, using, bail } = useNextOptions;

    if (error) {
      return this.nextError(error, ...using);
    }

    if (bail) {
      this.didBail = bail;
    }

    const { handler } = this.container;
    const { target } = this.context;

    this.shouldRun() ? handler.call(target, this._next, ...using) : this.skip();
  }

  abstract skipWith(times?: number, ...args: any[]): void;
}

import { Next } from './next';
import { FinalNext } from './finalNext';
