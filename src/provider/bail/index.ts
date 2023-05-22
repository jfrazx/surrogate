import type { RunOnBailParameters } from 'interfaces';
import type { NextNode } from '../../next';
import { Provider } from '../base';

export class BailProvider<T extends object, Arguments extends Array<any> = any[], Result = any>
  extends Provider<T, Arguments, Result>
  implements RunOnBailParameters<T>
{
  private recover = false;

  constructor(
    protected readonly node: NextNode<T>,
    public readonly receivedArgs: any[],
    public bailUsing: any,
  ) {
    super(node, receivedArgs);
  }

  bailWith(value: any): void {
    this.bailUsing = value;
  }

  recoverFromBail(recover: boolean): void {
    this.recover ||= recover;
  }

  get shouldRecover() {
    return this.recover;
  }
}
