import { NextNode } from '../../next';
import { Rule } from './interfaces';

export class PassSurrogateRule<T extends object> implements Rule<T> {
  includeArg(
    { container: { options }, context: { receiver } }: NextNode<T>,
    args: any[],
  ): any[] {
    return options.passSurrogate ? [receiver, ...args] : args;
  }
}
