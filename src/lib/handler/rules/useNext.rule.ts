import { NextNode } from '../../next';
import { Rule } from './interfaces';

export class UseNextRule<T extends object> implements Rule<T> {
  includeArg({ container: { options }, nextNode }: NextNode<T>, args: any[]): any[] {
    return options.useNext ? [nextNode, ...args] : args;
  }
}
