import type { NextNode } from '../../../next';
import type { NextRule } from './interfaces';

export class HandlerRule<T extends object> implements NextRule<T> {
  constructor(private readonly node: NextNode<T>, private readonly using: any[]) {}

  shouldRun(): boolean {
    return this.node.shouldRun(this.using);
  }

  run(node: NextNode<T>): void {
    const { container, didError } = node;
    const handler = container.getHandlerRunner(node);

    handler.run(this.using, didError);
  }
}
