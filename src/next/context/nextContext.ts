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
    const handler = container.getHandler(context) as Function;

    const result = handler.apply(context.receiver, this.currentArgs);

    this.setReturnValue(result);
    this.runNext(node.nextNode);
  }

  bail(bailWith?: any) {
    this.setReturnValue(bailWith);
  }

  handleError(error?: Error): never {
    this.logError(error);

    throw error;
  }
}
