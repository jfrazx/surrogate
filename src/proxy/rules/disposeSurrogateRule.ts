import { InternalMethods } from './interfaces';
import { ProxyRule } from './base';

export class DisposeSurrogateRule<T extends object> extends ProxyRule<T> {
  shouldHandle(): boolean {
    return this.event.toString() === InternalMethods.Dispose;
  }

  returnableValue() {
    return this.isDisposed ? () => {} : () => this.proxy.dispose(this.target);
  }
}
