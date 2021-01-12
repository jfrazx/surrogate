import { NextNode } from 'next/interfaces';
import { NextRule } from './interfaces';

export class CompleteRule<T extends object> implements NextRule<T> {
  constructor(private readonly using: any[]) {}

  shouldRun(): boolean {
    return true;
  }

  run(node: NextNode<T>): void {
    node.controller.complete(node, this.using);
  }
}
