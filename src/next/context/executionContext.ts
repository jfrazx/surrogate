import { MethodWrapper, WhichContainers } from '../../interfaces';
import { SurrogateHandlerContainer } from '../../containers';
import { TimeTrackable } from '../../timeTracker';
import { ContextController } from './interfaces';
import { SurrogateProxy } from '../../proxy';
import { asArray } from '@jfrazx/asarray';
import { NextNode } from '../interfaces';
import { PRE, POST } from '../../which';
import { Context } from '../../context';
import { isAsync } from '../../helpers';
import { Tail } from '../../containers';
import { v4 as uuid } from 'uuid';
import { Next } from '../nodes';

interface ExecutionConstruct<T extends object> {
  new (context: Context<T>): ContextController<T>;
}

const containerSorter = <T extends object>(
  a: SurrogateHandlerContainer<T>,
  b: SurrogateHandlerContainer<T>,
) =>
  a.options.priority === b.options.priority
    ? 0
    : a.options.priority > b.options.priority
    ? -1
    : 1;

export abstract class ExecutionContext<T extends object> implements ContextController<T> {
  private utilizeLatest = false;

  protected nextNode: NextNode<T>;

  readonly timeTracker = TimeTrackable.fetch();
  readonly correlationId = uuid();

  latestArgs: any[];
  returnValue: any;

  constructor(public readonly context: Context<T>) {}

  static for<T extends object>(context: Context<T>, typeContainers: WhichContainers<T>) {
    const hasAsync = this.hasAsync(typeContainers);
    const TargetContext: ExecutionConstruct<T> =
      hasAsync || isAsync(context.original) ? NextAsyncContext : NextContext;

    return new TargetContext(context);
  }

  setupPipeline(proxy: SurrogateProxy<T>, typeContainers: WhichContainers<T>) {
    const which = [PRE, POST] as const;

    which.forEach((type) => {
      const containers = [...typeContainers[type]];

      containers
        .sort(containerSorter)
        .forEach((container) => new Next(this, proxy, container, type));

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

  protected logError(error?: Error): void {
    console.error(`SurrogateError: ${error?.message ? error.message : JSON.stringify(error)}`);
  }

  abstract runOriginal(node: NextNode<T>): void;
  abstract handleError(error?: Error): never | void;
  abstract bail(bailWith?: any): any;
  abstract complete(): void;
  abstract start(): any;
}

import { NextAsyncContext } from './nextAsyncContext';
import { NextContext } from './nextContext';
