import { NextNode } from '../../next';
import { Rule } from './interfaces';

export class PassInstanceRule<T extends object> implements Rule<T> {
  includeArg(
    { container: { options }, context: { target } }: NextNode<T>,
    args: any[],
  ): any[] {
    return options.passInstance ? [...args, target] : args;
  }
}
