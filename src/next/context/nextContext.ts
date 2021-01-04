import { ExecutionContext } from './executionContext';
import { MethodNext } from '../nodes';

export class NextContext<T extends object> extends ExecutionContext<T> {
  start() {
    try {
      const { context } = this.nextNode;

      this.resetContext(context);
      this.runNext();

      return this.returnValue;
    } catch (error) {
      this.handleError(error);
    }
  }

  complete() {}

  runOriginal(node: MethodNext<T>) {
    const { container, context } = node;
    const { handler, originalArgs } = container;

    this.returnValue = handler.apply(context.target, originalArgs);

    this.runNext(node.nextNode);
  }

  bail(bailWith?: any) {
    this.returnValue ??= bailWith;
  }

  private handleError(error?: Error) {
    this.logError(error);

    throw error;
  }
}
