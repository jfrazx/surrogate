import { FetchRule, InternalMethods } from './interfaces';
import { SurrogateProxy } from '../proxy';

export class EventMangerRule<T extends object> implements FetchRule {
  constructor(
    private readonly proxy: SurrogateProxy<T>,
    private readonly target: T,
    private readonly event: string,
  ) {}

  shouldHandle(): boolean {
    return this.event.toString() === InternalMethods.EventManager;
  }

  returnableValue() {
    return () => this.proxy.getEventManager(this.target);
  }
}
