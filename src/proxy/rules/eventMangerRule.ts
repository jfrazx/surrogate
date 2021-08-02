import { InternalMethods } from './interfaces';
import { EventManager } from '../../manager';
import { ProxyRule } from './base';

export class EventMangerRule<T extends object> extends ProxyRule<T> {
  shouldHandle(): boolean {
    return this.event.toString() === InternalMethods.EventManager;
  }

  returnableValue() {
    return this.isDisposed
      ? () => new EventManager()
      : () => this.proxy.getEventManager(this.target);
  }
}
