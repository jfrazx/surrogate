import { NextNode } from 'next/interfaces';
import { NextRule } from './interfaces';

export class HandlerRule<T extends object> implements NextRule<T> {
  constructor(private readonly node: NextNode<T>, private readonly using: any[]) {}

  shouldRun(): boolean {
    return this.node.shouldRun(this.using);
  }

  run(node: NextNode<T>): void {
    const handler = node.container.getHandlerRunner(node);

    handler.run(this.using, node.didError);
  }
}
