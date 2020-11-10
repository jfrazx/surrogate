import { ExecutionContext } from './executionContext';
import { NextNode } from '../interfaces';

export class NextAsyncContext<T extends object> extends ExecutionContext<T> {
  private head: NextNode<T>;

  public resolver: (value: any) => void;
  private rejecter: (reason: any) => void;

  private runNext(next?: NextNode<T>) {
    const node = next ?? this.nextNode;

    this.setNext(node.nextNode);

    return node.next();
  }

  async start() {
    return new Promise((resolve, reject) => {
      this.resolver = resolve;
      this.rejecter = reject;

      try {
        this.runNext();
      } catch (error) {
        this.rejecter(error);
      }
    }).catch((error) => this.rejecter(error));
  }

  addNext(next: NextNode<T>): this {
    if (this.head) {
      this.head.addNext(next);
    } else {
      this.head = next;
    }

    return this;
  }

  complete(node: NextNode<T>, _passedArgs: any[]): void {
    this.setNext(node.nextNode);
  }

  setHooks(pre: NextNode<T>, post: NextNode<T>): this {
    pre.addNext(post);

    this.addNext(pre);

    return this;
  }

  bail(bailWith?: any) {
    this.resolver(bailWith ?? this.returnValue);
  }
}
