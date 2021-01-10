import { FetchRule, InternalMethods } from './interfaces';
import { Property } from '../../interfaces';
import { SurrogateProxy } from '../proxy';

export class EventMangerRule<T extends object> implements FetchRule {
  constructor(
    private readonly proxy: SurrogateProxy<T>,
    private readonly target: T,
    private readonly event: Property,
  ) {}

  shouldHandle(): boolean {
    return this.event.toString() === InternalMethods.EventManager;
  }

  returnableValue() {
    return () => this.proxy.targets.get(this.target);
  }
}
