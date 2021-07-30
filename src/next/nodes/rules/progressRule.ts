import { NextNode, NextOptions } from 'next/interfaces';
import { NextRule } from './interfaces';

export class ProgressRule<T extends object> implements NextRule<T> {
  constructor(protected readonly nextOptions: NextOptions) {}

  shouldRun(): boolean {
    return true;
  }

  run(node: NextNode<T>): void {
    node.nextNode.handleNext(this.nextOptions);
  }
}
