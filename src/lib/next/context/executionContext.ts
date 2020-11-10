import { Execution } from './interfaces';
import { NextNode } from '../interfaces';
import { isAsync } from '../../helpers';

interface ExecutionConstruct<T extends object> {
  new (originalMethod: Function, originalArgsL: any[]): Execution<T>;
}

export abstract class ExecutionContext<T extends object> implements Execution<T> {
  protected nextNode: NextNode<T>;
  protected returnValue: any;

  constructor(public originalMethod: Function, public originalArgs: any[]) {}

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
    this.returnValue = value;
  }

  setNext(next: NextNode<T>) {
    this.nextNode = next;
  }

  abstract start(): any;
  abstract bail(next: NextNode<T>, bailWith?: any): any;
  abstract setHooks(pre: NextNode<T>, post: NextNode<T>): this;
  abstract complete(node: NextNode<T>, passedArgs: any[]): void;
}

import { NextAsyncContext } from './nextAsyncContext';
import { NextContext } from './nextContext';
