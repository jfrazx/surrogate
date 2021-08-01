import { isFunction, isUndefined } from '../../helpers';
import { PRE, POST } from '../../which';
import { ProxyRule } from './base';

export class UnprocessableRule<T extends object> extends ProxyRule<T> {
  shouldHandle(): boolean {
    const original = Reflect.get(this.target, this.event);
    const manager = this.proxy.getEventManager(this.target);
    const { [PRE]: pre, [POST]: post } = manager?.getEventHandlers(this.event) ?? {};

    return (
      !isFunction(original) || isUndefined(manager) || !Boolean(pre?.length + post?.length)
    );
  }

  returnableValue() {
    return Reflect.get(this.target, this.event);
  }
}
