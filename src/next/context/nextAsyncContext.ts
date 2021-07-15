import { ExecutionContext } from './executionContext';
import { MethodNext } from '../nodes';

export class NextAsyncContext<T extends object> extends ExecutionContext<T> {
  private resolver: (value: any) => void;
  private rejecter: (reason: any) => void;

  async start() {
    return new Promise((resolve, reject) => {
      this.resolver = resolve;
      this.rejecter = reject;

      try {
        this.runNext(this.nextNode);
      } catch (error) {
        this.handleError(error);
      }
    });
  }

  complete(): void {
    this.resolver(this.returnValue);
  }

  async runOriginal(node: MethodNext<T>) {
    const { container, context } = node;
    const { handler } = container;

    try {
      const result = await handler.apply(context.receiver, this.currentArgs);

      this.setReturnValue(result);
      this.runNext(node.nextNode);
    } catch (error) {
      this.handleError(error);
    }
  }

  handleError(error?: Error) {
    this.logError(error);
    this.rejecter(error);
  }

  bail(bailWith?: any) {
    this.resolver(bailWith ?? this.returnValue);
  }
}
