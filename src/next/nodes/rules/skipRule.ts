import { NextNode } from 'next/interfaces';
import { NextRule } from './interfaces';

export class SkipRule<T extends object> implements NextRule<T> {
  shouldRun(): boolean {
    return true;
  }

  run(node: NextNode<T>): void {
    node.skip();
  }
}
