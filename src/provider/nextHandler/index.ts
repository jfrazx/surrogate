import { NextHandler } from '../../interfaces';
import { Provider } from '../base';

export class NextHandlerProvider<T extends object>
  extends Provider<T>
  implements NextHandler<T>
{
  get surrogate() {
    return this.context.receiver;
  }

  get next() {
    return this.node.nextNode;
  }
}
