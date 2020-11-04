import { ExecutionContext } from './executionContext';
import { NextNode } from '../interfaces';

export class NextContext<T extends object> extends ExecutionContext<T> {
  protected post: NextNode<T>;
  protected pre: NextNode<T>;

  start() {
    const { instance } = this.pre;

    try {
      this.pre.next();

      this.setReturnValue(this.originalMethod.apply(instance, this.originalArgs));

      this.post.next();

      return this.returnValue;
    } catch (error) {
      console.log(error);
      console.error(
        `SurrogateError: ${error?.message ? error.message : JSON.stringify(error)}`,
      );

      throw error;
    }
  }

  complete() {}
  bail() {}

  setHooks(pre: NextNode<T>, post: NextNode<T>): this {
    this.pre = pre;
    this.post = post;

    return this;
  }
}
