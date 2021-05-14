import { ExecutionContext } from './executionContext';
import { MethodNext } from '../nodes';

export class NextContext<T extends object> extends ExecutionContext<T> {
  start() {
    try {
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

    const result = handler.apply(context.target, originalArgs);

    this.setReturnValue(result);
    this.runNext(node.nextNode);
  }

  bail(bailWith?: any) {
    this.setReturnValue(bailWith);
  }

  private handleError(error?: Error) {
    this.logError(error);

    throw error;
  }
}
