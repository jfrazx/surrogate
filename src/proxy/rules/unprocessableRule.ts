import { isFunction, isUndefined } from '../../helpers';
import { SurrogateProxy } from '../handler';
import { FetchRule } from './interfaces';
import { PRE, POST } from '../../which';

export class UnprocessableRule<T extends object> implements FetchRule {
  constructor(
    private readonly proxy: SurrogateProxy<T>,
    private readonly target: T,
    private readonly event: string,
  ) {}

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
