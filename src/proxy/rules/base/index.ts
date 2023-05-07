import type { Surrogate } from '../../../interfaces';
import type { SurrogateProxy } from '../../handler';
import type { FetchRule } from '../interfaces';
import { isUndefined } from '../../../helpers';

export abstract class ProxyRule<T extends object> implements FetchRule {
  constructor(
    protected readonly proxy: SurrogateProxy<T>,
    protected readonly target: T,
    protected readonly event: string,
    protected readonly receiver: Surrogate<T>,
  ) {}

  protected get isDisposed() {
    return isUndefined(this.proxy.getEventManager(this.target));
  }

  abstract returnableValue(): any;
  abstract shouldHandle(): boolean;
}
