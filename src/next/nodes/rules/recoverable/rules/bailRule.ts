import type { NextRule, Recoverable } from '../../interfaces';
import { BailProvider } from '../../../../../provider';
import type { NextNode } from '../../../../../next';
import { RecoverableRule } from '../base';

export class BailRule<T extends object> extends RecoverableRule<T> implements NextRule<T> {
  shouldRun(): boolean {
    return Boolean(this.nextOptions.bail);
  }

  run(node: NextNode<T>): void {
    const { options } = node.container;
    const { using, bailWith } = this.nextOptions;
    const provider = new BailProvider(node, using!, bailWith);

    const shouldRecover = this.attemptRecovery(
      provider,
      options.runOnBail as Recoverable<T>,
      node.useContext,
    );

    shouldRecover
      ? this.recover(node, { bail: false })
      : node.controller.bail(provider.bailUsing);
  }
}
