import type { RunOnErrorParameters } from 'interfaces';
import type { NextNode } from '../../next';
import { Provider } from '../base';

export class ErrorProvider<T extends object, Arguments extends Array<any> = any, Result = any>
  extends Provider<T, Arguments, Result>
  implements RunOnErrorParameters<T>
{
  public timeOfError = new Date();
  private recover: boolean;

  constructor(node: NextNode<T>, receivedArgs: any[], public readonly error: Error) {
    super(node, receivedArgs, error);
  }

  recoverFromError(recover: boolean): void {
    this.recover ||= recover;
  }

  get shouldRecover(): boolean {
    return this.node.container.options.ignoreErrors || this.recover;
  }
}
