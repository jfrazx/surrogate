import { MethodWrapper, WhichContainers } from '../../interfaces';
import { TimeTrackable } from '../../timeTracker';
import { ContextController } from './interfaces';
import { Which, PRE, POST } from '../../which';
import { asArray } from '@jfrazx/asarray';
import { NextNode } from '../interfaces';
import { isAsync } from '../../helpers';
import { Tail } from '../../containers';
import { v4 as uuid } from 'uuid';
import { Next } from '../nodes';

interface ExecutionConstruct<T extends object> {
  new (originalMethod: Function, originalArgs: any[]): ContextController<T>;
}

export abstract class ExecutionContext<T extends object> implements ContextController<T> {
  private utilizeLatest = false;

  protected nextNode: NextNode<T>;

  readonly timeTracker = TimeTrackable.fetch();
  readonly correlationId = uuid();

  latestArgs: any[];
  returnValue: any;

  constructor(public readonly originalMethod: Function, public readonly originalArgs: any[]) {}

  static for<T extends object>(
    originalMethod: Function,
    originalArgs: any[],
    typeContainers: WhichContainers<T>,
  ) {
    const hasAsync = this.hasAsync(typeContainers);
    const TargetContext: ExecutionConstruct<T> =
      hasAsync || isAsync(originalMethod) ? NextAsyncContext : NextContext;

    return new TargetContext(originalMethod, originalArgs);
  }

  setupPipeline(
    proxy: SurrogateProxy<T>,
    context: Context<T>,
    typeContainers: WhichContainers<T>,
  ) {
    const which = [PRE, POST] as const;

    which.forEach((type) => {
      const containers = typeContainers[type];

      containers.forEach((container) => new Next(proxy, context, this, container, type));

      Tail.for<T>(type, this.originalArgs)(proxy, context, this);
    });

    return this;
  }

  private static hasAsync<T extends object>(typeContainers: WhichContainers<T>) {
    return Object.getOwnPropertySymbols(typeContainers)
      .flatMap((type) => typeContainers[type as Which])
      .some(
        ({ handler, options }) => isAsync(handler) || options.wrapper === MethodWrapper.Async,
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
    return this.utilizeLatest ? this.latestArgs : this.originalArgs;
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
import { SurrogateProxy } from '../../proxy/handler/index';
import { Context } from '../../context/index';
