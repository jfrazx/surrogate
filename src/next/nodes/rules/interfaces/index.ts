import { NextNode } from '../../../interfaces';

export interface NextRule<T extends object> {
  run(node: NextNode<T>): void;
  shouldRun(): boolean;
}
