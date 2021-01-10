import { ArgumentRule } from './interfaces';
import { NextNode } from '../../next';

export class PassSurrogateRule<T extends object> implements ArgumentRule<T> {
  includeArg(
    { container: { options }, context: { receiver } }: NextNode<T>,
    args: any[],
  ): any[] {
    return options.passSurrogate ? [receiver, ...args] : args;
  }
}
