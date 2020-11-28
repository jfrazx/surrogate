import { NextNode } from '../../next';
import { Rule } from './interfaces';

export class PassErrorRule<T extends object> implements Rule<T> {
  constructor(private error?: Error) {}

  includeArg({ container: { options } }: NextNode<T>, args: any[]): any[] {
    return options.passErrors && this.error ? [...args, this.error] : args;
  }
}
