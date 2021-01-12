import { HandlerRunner } from '../../../handler';
import { NextNode } from 'next/interfaces';
import { NextRule } from './interfaces';

export class HandlerRule<T extends object> implements NextRule<T> {
  constructor(private readonly node: NextNode<T>, private readonly using: any[]) {}

  shouldRun(): boolean {
    return this.node.shouldRun();
  }

  run(node: NextNode<T>): void {
    const handler = HandlerRunner.for(node);

    handler.run(this.using, node.didError);
  }
}
