import type { NextRule, Recoverable } from '../../interfaces';
import { ErrorProvider } from '../../../../../provider';
import type { NextNode } from '../../../../../next';
import { RecoverableRule } from '../base';

export class ErrorRule<T extends object> extends RecoverableRule<T> implements NextRule<T> {
  shouldRun(): boolean {
    return Boolean(this.nextOptions.error);
  }

  run(node: NextNode<T>): void {
    const { options } = node.container;
    const { error, using } = this.nextOptions;

    const provider = new ErrorProvider(node, using!, error as Error);

    const shouldRecover = this.attemptRecovery(
      provider,
      options.runOnError as Recoverable<T>,
      node.useContext,
    );

    shouldRecover
      ? this.recover(node, { error: null })
      : node.controller.handleError(node, error as Error);
  }
}
