import { ArgumentRule } from './interfaces';
import { NextNode } from '../../next';

export class PassErrorRule<T extends object> implements ArgumentRule<T> {
  constructor(private error?: Error) {}

  includeArg({ container: { options } }: NextNode<T>, args: any[]): any[] {
    return options.passErrors && this.error ? [this.error, ...args] : args;
  }
}
