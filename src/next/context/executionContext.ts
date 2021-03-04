import { ContextController } from './interfaces';
import { NextNode } from '../interfaces';
import { Context } from '../../context';
import { isAsync } from '../../helpers';

interface ExecutionConstruct<T extends object> {
  new (
    originalMethod: Function,
    originalArgs: any[],
    shouldResetContext: boolean,
  ): ContextController<T>;
}

export abstract class ExecutionContext<T extends object> implements ContextController<T> {
  protected nextNode: NextNode<T>;
  protected returnValue: any;

  constructor(
    public originalMethod: Function,
    public originalArgs: any[],
    protected shouldResetContext: boolean,
  ) {}

  static for<T extends object>(
    originalMethod: Function,
    originalArgs: any[],
    hasAsync: boolean,
    resetContext: boolean,
  ) {
    const TargetContext: ExecutionConstruct<T> =
      hasAsync || isAsync(originalMethod) ? NextAsyncContext : NextContext;

    return new TargetContext(originalMethod, originalArgs, resetContext);
  }

  protected setReturnValue(value: any) {
    this.returnValue ??= value;
  }

  protected resetContext(context: Context<T>): void {
    this.shouldResetContext ? context.resetContext() : context.createRetrievableContext();
  }

  setNext(next: NextNode<T>) {
    this.nextNode = next;
  }

  addNext(next: NextNode<T>): this {
    if (this.nextNode) {
      this.nextNode.addNext(next);
    } else {
      this.nextNode = next;
    }

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

  abstract start(): any;
  abstract bail(bailWith?: any): any;
  abstract runOriginal(node: NextNode<T>): void;
  abstract complete(): void;
}

import { NextAsyncContext } from './nextAsyncContext';
import { NextContext } from './nextContext';
