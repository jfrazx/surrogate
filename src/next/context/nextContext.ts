import { ExecutionContext } from './executionContext';
import { MethodNext } from '../nodes';

export class NextContext<T extends object> extends ExecutionContext<T> {
  start() {
    try {
      this.runNext();

      return this.complete();
    } catch (error) {
      this.handleError(error);
    }
  }

  complete() {
    return this.returnValue;
  }

  runOriginal(node: MethodNext<T>) {
    const { container, context } = node;
    const { handler, originalArgs } = container;

    const result = handler.apply(context.receiver, originalArgs);

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
