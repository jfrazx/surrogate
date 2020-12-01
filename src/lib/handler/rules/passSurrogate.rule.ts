import { NextNode } from '../../next';
import { Rule } from './interfaces';

export class PassSurrogateRule implements Rule {
  includeArg(
    { container: { options }, context: { receiver } }: NextNode<any>,
    args: any[],
  ): any[] {
    return options.passSurrogate ? [...args, receiver] : args;
  }
}
