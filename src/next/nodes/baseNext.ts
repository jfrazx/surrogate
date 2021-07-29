import { IContainer, ContainerGenerator, TailGeneration } from '../../containers';
import { SurrogateUnwrapped, HookType } from '../../interfaces';
import { INext, NextOptions, NextNode } from '../interfaces';
import { RunConditionProvider } from '../../provider';
import { SurrogateProxy } from '../../proxy/handler';
import { ContextController } from '../context';
import { asArray } from '@jfrazx/asarray';
import { Which, PRE } from '../../which';
import { Context } from '../../context';

export interface NextConstruct<T extends object> {
  new (
    proxy: SurrogateProxy<T>,
    context: Context<T>,
    controller: ContextController<T>,
    generator: ContainerGenerator<T>,
    container: IContainer<T>,
    hookFor: Which,
    args?: any[],
  ): NextNode<T>;
}

export abstract class BaseNext<T extends object> implements INext {
  public nextNode: NextNode<T> = null;
  public prevNode: NextNode<T> = null;
  public didError: Error = null;

  constructor(
    protected proxy: SurrogateProxy<T>,
    public context: Context<T>,
    public controller: ContextController<T>,
    protected generator: ContainerGenerator<T>,
    public container: IContainer<T>,
    public hookFor: Which,
  ) {
    controller.addNext(this);
  }

  static for<T extends object>(
    proxy: SurrogateProxy<T>,
    context: Context<T>,
    controller: ContextController<T>,
    generator: ContainerGenerator<T>,
    hookType: Which,
  ): NextNode<T> {
    const { value, done } = generator.next();

    return done
      ? (value as TailGeneration<T>)(proxy, context, controller, generator, hookType)
      : new Next(proxy, context, controller, generator, value as any, hookType);
  }

  skip(times: number = 1): void {
    return this.skipWith(times);
  }

  next(options?: NextOptions): void {
    this.controller.timeTracker.setHookEnd();

    this.handleNext(options);
  }

  nextError(error: Error, using: any[], nextOptions: NextOptions) {
    const { options } = this.container;

    this.didError = error;

    if (options.ignoreErrors) {
      return this.handleNext({
        ...nextOptions,
        using,
        error: null,
      });
    }

    this.controller.handleError(error);
  }

  shouldRun(using: any[]): boolean {
    const runParameters = new RunConditionProvider(this, using, this.prevNode?.didError);
    const { options } = this.container;
    const context = this.useContext;

    return asArray(options.runConditions).every((condition) => {
      runParameters.reset();

      return condition.call(context, runParameters);
    });
  }

  get instance(): SurrogateUnwrapped<T> {
    return this.context.target as SurrogateUnwrapped<T>;
  }

  get hookType() {
    return this.hookFor === PRE ? HookType.PRE : HookType.POST;
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

  private shouldReplace(options: NextOptions) {
    return 'replace' in options;
  }

  protected replace(options: NextOptions) {
    if (this.shouldReplace(options)) {
      this.controller.updateLatestArgs(options.replace);
    }
  }

  abstract skipWith(times?: number, ...args: any[]): void;
  abstract handleNext(options?: NextOptions): void;
}

import { Next } from './next';
