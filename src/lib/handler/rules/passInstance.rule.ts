import { NextNode } from '../../next';
import { Rule } from './interfaces';

export class PassInstanceRule implements Rule {
  includeArg(
    { container: { options }, context: { target } }: NextNode<any>,
    args: any[],
  ): any[] {
    return options.passInstance ? [...args, target] : args;
  }
}
