import { SurrogateMethodOptions, Unwrapped } from '../../interfaces';
import { IContainer, ContainerGenerator } from '../../container';
import { INext, NextOptions, NextNode } from '../interfaces';
import { SurrogateProxy } from '../../surrogateProxy';
import { asArray } from '@jfrazx/asarray';
import { Context } from '../../context';
import { Execution } from '../context';

const defaultErrorOptions: SurrogateMethodOptions<any> = {
  passErrors: false,
  ignoreErrors: false,
  passInstance: false,
};

interface NextConstruct<T extends object> {
  new (
    proxy: SurrogateProxy<T>,
    context: Context<T>,
    controller: Execution<T>,
    generator: Generator<IContainer<T>, IContainer<T>, ContainerGenerator<T>>,
    container: IContainer<T>,
  ): NextNode<T>;
}

export abstract class BaseNext<T extends object> implements INext<T> {
  public nextNode: NextNode<T> = null;
  public didBail = false;

  constructor(
    protected proxy: SurrogateProxy<T>,
    public context: Context<T>,
    public controller: Execution<T>,
    protected generator: Generator<IContainer<T>, IContainer<T>, ContainerGenerator<T>>,
    protected container: IContainer<T>,
  ) {}

  static for<T extends object>(
    proxy: SurrogateProxy<T>,
    context: Context<T>,
    controller: Execution<T>,
    generator: Generator<IContainer<T>, IContainer<T>, ContainerGenerator<T>>,
  ): NextNode<T> {
    const { value, done } = generator.next();

    const UseNext: NextConstruct<T> = done ? FinalNext : (Next as any);

    return new UseNext(proxy, context, controller, generator, value as any);
  }

  skip(times: number = 1): void {
    return this.skipWith(times);
  }

  nextError(error: Error, ...args: any[]) {
    console.log(this);
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

    console.log('about to error', error);

    this.generator.throw(error);
  }

  protected determineErrorArgs(
    { passErrors, passInstance }: SurrogateMethodOptions<T>,
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
    return this.context.target as Unwrapped<T>;
  }

  addNext(next: NextNode<T>) {
    if (this.nextNode) {
      return this.nextNode.addNext(next);
    }

    this.nextNode = next;
  }

  abstract skipWith(times?: number, ...args: any[]): void;
  abstract next(options?: NextOptions): void;
}

import { Next } from './next';
import { FinalNext } from './finalNext';
