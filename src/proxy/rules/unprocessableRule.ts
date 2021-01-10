import { isFunction, isUndefined } from '../../helpers';
import { Property } from '../../interfaces';
import { SurrogateProxy } from '../proxy';
import { FetchRule } from './interfaces';
import { PRE, POST } from '../../which';

export class UnprocessableRule<T extends object> implements FetchRule {
  constructor(
    private readonly proxy: SurrogateProxy<T>,
    private readonly target: T,
    private readonly event: Property,
  ) {}

  shouldHandle(): boolean {
    const original = Reflect.get(this.target, this.event);
    const manager = this.proxy.targets.get(this.target);

    if (!isFunction(original) || isUndefined(manager)) {
      return true;
    }

    const { [PRE]: pre, [POST]: post } = manager.getEventHandlers(this.event);

    return !Boolean(pre.length + post.length);
  }

  returnableValue() {
    return Reflect.get(this.target, this.event);
  }
}
