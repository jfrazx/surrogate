import { TimeTrackable } from '../../timeTracker';
import { ContextController } from './interfaces';
import { NextNode } from '../interfaces';
import { isAsync } from '../../helpers';

interface ExecutionConstruct<T extends object> {
  new (originalMethod: Function, originalArgs: any[]): ContextController<T>;
}

export abstract class ExecutionContext<T extends object> implements ContextController<T> {
  readonly timeTracker = TimeTrackable.fetch();

  protected nextNode: NextNode<T>;
  returnValue: any;

  constructor(public readonly originalMethod: Function, public readonly originalArgs: any[]) {}

  static for<T extends object>(
    originalMethod: Function,
    originalArgs: any[],
    hasAsync: boolean,
  ) {
    const TargetContext: ExecutionConstruct<T> =
      hasAsync || isAsync(originalMethod) ? NextAsyncContext : NextContext;

    return new TargetContext(originalMethod, originalArgs);
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

  protected runNext(next?: NextNode<T>) {
    const node = next ?? this.nextNode;

    this.setNext(node.nextNode);

    return node.next();
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
