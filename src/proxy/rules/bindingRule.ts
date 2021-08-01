import { ProxyRule } from './base';

export class BindingRule<T extends object> extends ProxyRule<T> {
  shouldHandle(): boolean {
    return true;
  }

  returnableValue() {
    const { target, event, receiver } = this;

    return this.proxy.bindHandler(event, target, receiver);
  }
}
