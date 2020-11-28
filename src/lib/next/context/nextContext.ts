import { ExecutionContext } from './executionContext';
import { MethodNext } from '../nodes';

export class NextContext<T extends object> extends ExecutionContext<T> {
  start() {
    try {
      this.runNext();

      return this.returnValue;
    } catch (error) {
      this.logError(error);

      throw error;
    }
  }

  complete() {}

  runOriginal(node: MethodNext<T>) {
    const { container, context } = node;
    const { handler, originalArgs } = container;

    this.returnValue = handler.apply(context.original, originalArgs);

    this.runNext(node.nextNode);
  }

  bail(bailWith?: any) {
    this.returnValue ??= bailWith;
  }
}
