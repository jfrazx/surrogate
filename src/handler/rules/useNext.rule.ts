import { ArgumentRule } from './interfaces';
import { NextNode } from '../../next';

export class UseNextRule<T extends object> implements ArgumentRule<T> {
  includeArg({ container: { options }, nextNode }: NextNode<T>, args: any[]): any[] {
    return options.useNext ? [nextNode, ...args] : args;
  }
}
