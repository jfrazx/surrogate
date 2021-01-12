import { NextNode, NextOptions } from 'next/interfaces';
import { NextRule } from './interfaces';

export class ErrorRule<T extends object> implements NextRule<T> {
  constructor(
    private readonly error: Error | boolean,
    private readonly using: any[],
    private readonly nextOptions: NextOptions,
  ) {}

  shouldRun(): boolean {
    return Boolean(this.error);
  }

  run(node: NextNode<T>): void {
    node.nextError(this.error as Error, this.using, this.nextOptions);
  }
}
