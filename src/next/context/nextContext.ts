import { ExecutionContext } from './executionContext';
import type { NextNode } from '../../next/';
import type { MethodNext } from '../nodes';

export class NextContext<T extends object> extends ExecutionContext<T> {
  start() {
    this.runNext();

    return this.complete();
  }

  complete() {
    return this.returnValue;
  }

  runOriginal(node: MethodNext<T>) {
    const { container, context } = node;
    const handler = container.getHandler(context) as Function;

    const result = handler.apply(context.receiver, this.currentArgs);

    this.setReturnValue(result);
    this.runNext(node.nextNode);
  }

  bail(bailWith?: any) {
    this.setReturnValue(bailWith);
  }

  handleError(node: NextNode<T>, error: Error): never {
    this.logError(node, error);

    throw error;
  }
}
