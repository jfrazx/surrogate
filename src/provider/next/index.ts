import { NextParameters } from 'interfaces';
import { Provider } from '../base';

export class NextProvider<T extends object> extends Provider<T> implements NextParameters<T> {
  get surrogate() {
    return this.context.receiver;
  }

  get next() {
    return this.node;
  }
}
