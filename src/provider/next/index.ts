import type { NextParameters } from '../../interfaces';
import { Provider } from '../base';

export class NextProvider<T extends object, Arguments extends Array<any> = any, Result = any>
  extends Provider<T, Arguments, Result>
  implements NextParameters<T, Arguments>
{
  get surrogate() {
    return this.context.receiver;
  }

  get next() {
    return this.node;
  }
}
