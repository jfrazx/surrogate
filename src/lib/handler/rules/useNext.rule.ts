import { NextNode } from '../../next';
import { Rule } from './interfaces';

export class UseNextRule implements Rule {
  includeArg({ container: { options }, nextNode }: NextNode<any>, args: any[]): any[] {
    return options.useNext ? [...args, nextNode] : args;
  }
}
