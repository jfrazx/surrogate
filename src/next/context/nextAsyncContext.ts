import { ExecutionContext } from './executionContext';
import { MethodNext } from '../nodes';
import { NextNode } from '../../next';

export class NextAsyncContext<T extends object> extends ExecutionContext<T> {
  private rejecter: (reason: any) => void;
  private resolver: (value: any) => void;

  async start() {
    return new Promise((resolve, reject) => {
      this.resolver = resolve;
      this.rejecter = reject;

      try {
        this.runNext(this.nextNode);
      } catch (error: any) {
        this.handleError(error);
      }
    });
  }

  complete(): void {
    this.resolver(this.returnValue);
  }

  async runOriginal(node: MethodNext<T>) {
    const { container, context } = node;
    const handler = container.getHandler(context) as Function;

    try {
      const result = await handler.apply(context.receiver, this.currentArgs);

      this.setReturnValue(result);
      this.runNext(node.nextNode);
    } catch (error: any) {
      this.handleError(this.nextNode, error);
    }
  }

  handleError(node: NextNode<T>, error?: Error) {
    this.logError(node, error);
    this.rejecter(error);
  }

  bail(bailWith?: any) {
    this.resolver(bailWith ?? this.returnValue);
  }
}
