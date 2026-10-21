import { isUndefined } from '../../helpers';
import { ProxyRule } from './base';

export class ConstructorRule<T extends object> extends ProxyRule<T> {
  // A constructor defined on the instance itself wins: it may be one the Proxy
  // get invariant requires us to return, or one assigned through the proxy.
  shouldHandle(): boolean {
    return (
      this.event === 'constructor' &&
      !Reflect.getOwnPropertyDescriptor(this.target, this.event) &&
      !isUndefined(this.reportedConstructor)
    );
  }

  returnableValue() {
    return this.reportedConstructor;
  }

  private get reportedConstructor() {
    return this.proxy.getReportedConstructor();
  }
}
