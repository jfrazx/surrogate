import { isUndefined } from '../../helpers';
import { ProxyRule } from './base';

export class ConstructorRule<T extends object> extends ProxyRule<T> {
  shouldHandle(): boolean {
    return this.event === 'constructor' && !isUndefined(this.reportedConstructor);
  }

  returnableValue() {
    return this.reportedConstructor;
  }

  private get reportedConstructor() {
    return this.proxy.getReportedConstructor(this.target);
  }
}
