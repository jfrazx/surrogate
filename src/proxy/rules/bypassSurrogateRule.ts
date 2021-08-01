import { InternalMethods } from './interfaces';
import { ProxyRule } from './base';

export class BypassSurrogateRule<T extends object> extends ProxyRule<T> {
  shouldHandle(): boolean {
    return this.event.toString() === InternalMethods.Bypass;
  }

  returnableValue() {
    return () => this.target;
  }
}
