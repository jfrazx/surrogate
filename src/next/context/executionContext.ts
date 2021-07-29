import { TimeTrackable } from '../../timeTracker';
import { ContextController } from './interfaces';
import { asArray } from '@jfrazx/asarray';
import { NextNode } from '../interfaces';
import { isAsync } from '../../helpers';
import { v4 as uuid } from 'uuid';

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
