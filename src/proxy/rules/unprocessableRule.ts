import { isFunction, isUndefined, isBool } from '../../helpers';
import { MethodIdentifier } from '../../identifier';
import { EventManager } from '../../manager';
import { PRE, POST } from '../../which';
import { ProxyRule } from './base';

export class UnprocessableRule<T extends object> extends ProxyRule<T> {
  shouldHandle(): boolean {
    const original = Reflect.get(this.target, this.event);
    const manager = this.proxy.getEventManager(this.target);

    return (
      !isFunction(original) || isUndefined(manager) || this.shouldMaintainContext(manager)
    );
  }

  returnableValue() {
    return Reflect.get(this.target, this.event);
  }

  private shouldMaintainContext(manager: EventManager<T>): boolean {
    const { [PRE]: pre, [POST]: post } = manager.getEventHandlers(this.event);

    return Boolean(pre?.length + post?.length)
      ? false
      : this.eventSpecificContextDetermination(manager);
  }

  private eventSpecificContextDetermination({ globalOptions }: EventManager<T>): boolean {
    const { maintainContext = false } = globalOptions;

    if (isBool(maintainContext)) {
      return !maintainContext;
    }

    const events = Array.isArray(maintainContext) ? maintainContext : [maintainContext];
    const identifier = new MethodIdentifier(this.target);

    return identifier.doesNotIncludeEvent(this.event, events);
  }
}
