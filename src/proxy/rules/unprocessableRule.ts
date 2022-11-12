import { isUndefined, isBool } from '../../helpers';
import { MethodIdentifier } from '../../identifier';
import type { EventManager } from '../../manager';
import { asArray } from '@jfrazx/asarray';
import { ProxyRule } from './base';

export class UnprocessableRule<T extends object> extends ProxyRule<T> {
  shouldHandle(): boolean {
    const manager = this.proxy.getEventManager(this.target);

    return isUndefined(manager) || this.shouldMaintainContext(manager);
  }

  returnableValue() {
    return Reflect.get(this.target, this.event);
  }

  private shouldMaintainContext(manager: EventManager<T>): boolean {
    return manager.eventIsHandled(this.event)
      ? false
      : this.eventSpecificContextDetermination(manager);
  }

  private eventSpecificContextDetermination({ globalOptions }: EventManager<T>): boolean {
    const identifier = new MethodIdentifier(this.target);
    const { maintainContext = false } = globalOptions;

    return isBool(maintainContext)
      ? this.isNotAccessor(identifier, maintainContext)
      : identifier.doesNotIncludeEvent(this.event, asArray(maintainContext));
  }

  private isNotAccessor(identifier: MethodIdentifier<T>, maintainContext: boolean): boolean {
    return maintainContext
      ? identifier.doesNotIncludeEvent(this.event, identifier.instanceMethodNames())
      : !maintainContext;
  }
}
