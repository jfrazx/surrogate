import { RecoverableProvider } from '../../../../interfaces';
import { NextNode } from '../../../interfaces';

export interface NextRule<T extends object> {
  run(node: NextNode<T>): void;
  shouldRun(): boolean;
}

export type Recoverable<T extends object> = (provider: RecoverableProvider<T>) => any;
