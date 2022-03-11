import { RunOnBailParameters } from 'interfaces';
import { NextNode } from '../../next';
import { Provider } from '../base';

export class BailProvider<T extends object>
  extends Provider<T>
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
    this.recover = this.recover || recover;
  }

  get shouldRecover() {
    return this.recover;
  }
}
