import { NextNode } from '../../../next';

export interface ArgumentRule<T extends object> {
  includeArg(node: NextNode<T>, args: any[]): any[];
}
