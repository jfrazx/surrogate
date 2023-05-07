import type { RunConditionParameters } from '../../interfaces';
import { isUndefined } from '../../helpers';
import { Provider } from '../base';

export class RunConditionProvider<T extends object, Arguments extends Array<any>>
  extends Provider<T, Arguments>
  implements RunConditionParameters<T>
{
  private valuesFromConditions: any[] = [];
  private valueFromLastCondition: any;

  passToNextCondition(value: any): void {
    this.valueFromLastCondition = value;
  }

  reset() {
    this.valuesFromConditions.push(this.valueFromLastCondition);
    this.valueFromLastCondition = undefined;
  }

  get didError() {
    return Boolean(this.error);
  }

  get valueFromCondition() {
    return this.valuesFromConditions[this.valuesFromConditions.length - 1];
  }

  get didReceiveFromLastCondition() {
    return !isUndefined(this.valueFromCondition);
  }
}
