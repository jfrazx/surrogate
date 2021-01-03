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

  setHooks(pre: NextNode<T>, post: NextNode<T>): this {
    pre.addNext(post);

    this.addNext(pre);

    return this;
  }

  protected addNext(next: NextNode<T>): this {
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
  abstract complete(node: NextNode<T>, passedArgs: any[]): void;
}

import { NextAsyncContext } from './nextAsyncContext';
import { NextContext } from './nextContext';
