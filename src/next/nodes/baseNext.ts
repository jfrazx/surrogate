import { IContainer, ContainerGenerator, TailGeneration } from '../../containers';
import { SurrogateHandlerOptions, SurrogateUnwrapped } from '../../interfaces';
import { INext, NextOptions, NextNode } from '../interfaces';
import { SurrogateProxy } from '../../proxy';
import { asArray } from '@jfrazx/asarray';
import { Context } from '../../context';
import { Execution } from '../context';

const defaultErrorOptions: SurrogateHandlerOptions<any> = {
  passErrors: false,
  ignoreErrors: false,
  passInstance: false,
};

export interface NextConstruct<T extends object> {
  new (
    proxy: SurrogateProxy<T>,
    context: Context<T>,
    controller: Execution<T>,
    generator: ContainerGenerator<T>,
    container: IContainer<T>,
    args?: any[],
  ): NextNode<T>;
}

export abstract class BaseNext<T extends object> implements INext<T> {
  public nextNode: NextNode<T> = null;
  public prevNode: NextNode<T> = null;
  public didError: Error = null;

  constructor(
    protected proxy: SurrogateProxy<T>,
    public context: Context<T>,
    public controller: Execution<T>,
    protected generator: ContainerGenerator<T>,
    public container: IContainer<T>,
  ) {
    controller.addNext(this);
  }

  static for<T extends object>(
    proxy: SurrogateProxy<T>,
    context: Context<T>,
    controller: Execution<T>,
    generator: ContainerGenerator<T>,
  ): NextNode<T> {
    const { value, done } = generator.next();

    return done
      ? (value as TailGeneration<T>)(proxy, context, controller, generator)
      : new Next(proxy, context, controller, generator, value as any);
  }

  skip(times: number = 1): void {
    return this.skipWith(times);
  }

  nextError(error: Error, using: any[], nextOptions: NextOptions) {
    const { options } = this.container;
    const useOptions = { ...defaultErrorOptions, ...options };

    this.didError = error;

    if (useOptions.ignoreErrors) {
      return this.next({
        ...nextOptions,
        using,
        error: null,
      });
    }

    this.generator.throw(error);
  }

  shouldRun(): boolean {
    const { options } = this.container;
    const context = this.useContext;
    const instance = this.instance;

    return asArray(options.runConditions).every((condition) =>
      condition.call(context, instance),
    );
  }

  get instance(): SurrogateUnwrapped<T> {
    return this.context.target as SurrogateUnwrapped<T>;
  }

  addNext(next: NextNode<T>) {
    if (this.nextNode) {
      return this.nextNode.addNext(next);
    }

    this.nextNode = next;
    next.prevNode = this;
  }

  protected get useContext() {
    return this.context.determineContext(this.container.options);
  }

  abstract skipWith(times?: number, ...args: any[]): void;
  abstract next(options?: NextOptions): void;
}

import { Next } from './next';