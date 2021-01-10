import { ArgumentRule } from './interfaces';
import { NextNode } from '../../next';

export class PassInstanceRule<T extends object> implements ArgumentRule<T> {
  includeArg(
    { container: { options }, context: { target } }: NextNode<T>,
    args: any[],
  ): any[] {
    return options.passInstance ? [target, ...args] : args;
  }
}
