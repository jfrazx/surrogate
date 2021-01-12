import { NextNode, NextOptions } from 'next/interfaces';
import { NextRule } from './interfaces';

export class BailRule<T extends object> implements NextRule<T> {
  constructor(private readonly nextOptions: NextOptions) {}

  shouldRun(): boolean {
    return Boolean(this.nextOptions.bail);
  }

  run(node: NextNode<T>): void {
    node.controller.bail(this.nextOptions.bailWith);
  }
}
