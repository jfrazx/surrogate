import { RecoverableProvider, Contexts } from '../../../../../interfaces';
import { NextNode, NextOptions } from '../../../../interfaces';
import { NextRule, Recoverable } from '../../interfaces';
import { asArray } from '@jfrazx/asarray';

export abstract class RecoverableRule<T extends object> implements NextRule<T> {
  abstract run(node: NextNode<T>): void;
  abstract shouldRun(): boolean;

  constructor(protected readonly nextOptions: NextOptions) {}

  protected attemptRecovery(
    provider: RecoverableProvider<T>,
    recoverable: Recoverable<T>,
    context: Contexts,
  ): boolean {
    asArray(recoverable).forEach((recover) => recover.call(context, provider));

    return provider.shouldRecover;
  }

  protected recover(node: NextNode<T>, overrideOptions: NextOptions): void {
    node.next({
      ...this.nextOptions,
      ...overrideOptions,
    });
  }
}
