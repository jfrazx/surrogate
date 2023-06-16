import type { SurrogateHandlerContainer } from '../../containers';
import type { WhichContainers } from '../../interfaces';
import type { ContextController } from './interfaces';
import type { SurrogateProxy } from '../../proxy';
import { TimeTrackable } from '../../timeTracker';
import { MethodWrapper } from '../../constants';
import type { NextNode } from '../interfaces';
import type { Context } from '../../context';
import { isFunction } from '../../helpers';
import { containerSorter } from './utils';
import { asArray } from '@jfrazx/asarray';
import { isAsync } from '../../helpers';
import { Tail } from '../../containers';
import { HookType } from '../../which';
import { v4 as uuid } from 'uuid';
import { Next } from '../nodes';

interface ExecutionConstruct<T extends object> {
  new (context: Context<T>): ContextController<T>;
}

export abstract class ExecutionContext<T extends object> implements ContextController<T> {
  private utilizeLatest = false;
  private hasThrown = false;

  protected nextNode!: NextNode<T>;

  readonly timeTracker = TimeTrackable.fetch();
  readonly correlationId = uuid();

  latestArgs!: any[];
  returnValue: any;

  constructor(public readonly context: Context<T>) {}

  static for<T extends object>(context: Context<T>, typeContainers: WhichContainers<T>) {
    const hasAsync = this.hasAsync(typeContainers);
    const TargetContext: ExecutionConstruct<T> =
      hasAsync || isAsync(context.original) ? NextAsyncContext : NextContext;

    return new TargetContext(context);
  }

  setupPipeline(proxy: SurrogateProxy<T>, typeContainers: WhichContainers<T>) {
    const which = [HookType.PRE, HookType.POST] as const;

    which.forEach((type: Which) => {
      const containers: SurrogateHandlerContainer<T>[] = [...typeContainers[type]];

      containers
        .sort(containerSorter)
        .forEach(
          (container: SurrogateHandlerContainer<T>) => new Next(this, proxy, container, type),
        );

      Tail.for<T>(this, proxy, type);
    });

    return this;
  }

  private static hasAsync<T extends object>(typeContainers: WhichContainers<T>) {
    return Object.values(typeContainers)
      .flat()
      .some(
        ({ handler, options }: SurrogateHandlerContainer<T>) =>
          isAsync(handler) || options.wrapper === MethodWrapper.Async,
      );
  }

  protected setReturnValue(value: any) {
    this.returnValue ??= value;
  }

  setNext(next: NextNode<T>) {
    this.nextNode = next;
  }

  addNext(next: NextNode<T>): this {
    this.nextNode ? this.nextNode.addNext(next) : this.setNext(next);

    return this;
  }

  updateLatestArgs(updatedArgs: any): void {
    this.utilizeLatest = true;
    this.latestArgs = asArray(updatedArgs);
  }

  get currentArgs() {
    return this.utilizeLatest ? this.latestArgs : this.context.originalArguments;
  }

  protected runNext(next?: NextNode<T>) {
    const node = next ?? this.nextNode;

    this.setNext(node.nextNode);

    return node.handleNext();
  }

  protected logError(node: NextNode<T>, error: Error): void {
    const { silenceErrors } = node.container.options;

    const silence = isFunction(silenceErrors) ? silenceErrors(error) : silenceErrors;

    if (!silence && !this.hasThrown) {
      this.hasThrown = true;

      console.error(
        `SurrogateError: ${error?.message ? error.message : JSON.stringify(error)}`,
      );
    }
  }

  abstract handleError(node: NextNode<T>, error?: Error): never | void;

  /**
   * @description Runs the target method after pre hooks and before post hooks.
   *
   * @note Original method could be an instance method of the proxied class if it is a member of hook pipeline
   *
   * @abstract
   * @param {NextNode<T>} node
   * @memberof ExecutionContext
   */
  abstract runOriginal(node: NextNode<T>): void;
  abstract bail(bailWith?: any): any;
  abstract complete(): void;
  abstract start(): any;
}

import { NextAsyncContext } from './nextAsyncContext';
import { NextContext } from './nextContext';
import { Which } from '../../which';
