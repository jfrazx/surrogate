import { RunOnErrorParameters } from '../../interfaces';
import { NextNode } from '../../next';
import { Provider } from '../base';

export class ErrorProvider<T extends object>
  extends Provider<T>
  implements RunOnErrorParameters<T>
{
  constructor(
    protected readonly node: NextNode<T>,
    public readonly receivedArgs: any[],
    public readonly error: Error,
  ) {
    super(node, receivedArgs, error);
  }
}
