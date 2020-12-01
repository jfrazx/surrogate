import { NextNode } from '../../../next';

export interface Rule {
  includeArg(node: NextNode<any>, args: any[]): any[];
}
