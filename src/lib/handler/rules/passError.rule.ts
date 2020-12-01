import { NextNode } from '../../next';
import { Rule } from './interfaces';

export class PassErrorRule implements Rule {
  constructor(private error?: Error) {}

  includeArg({ container: { options } }: NextNode<any>, args: any[]): any[] {
    return options.passErrors && this.error ? [...args, this.error] : args;
  }
}
