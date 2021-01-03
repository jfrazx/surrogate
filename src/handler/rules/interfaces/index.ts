import { NextNode } from '../../../next';

export interface Rule<T extends object> {
  includeArg(node: NextNode<T>, args: any[]): any[];
}
