import { FetchRule, InternalMethods } from './interfaces';
import { SurrogateProxy } from '../proxy';

export class BypassSurrogateRule<T extends object> implements FetchRule {
  constructor(
    protected readonly proxy: SurrogateProxy<T>,
    private readonly target: T,
    private readonly event: string,
  ) {}

  shouldHandle(): boolean {
    return this.event.toString() === InternalMethods.Bypass;
  }

  returnableValue() {
    return () => this.target;
  }
}
