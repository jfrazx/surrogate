import { ProviderParameters } from './provider';

export interface RunConditionParameters<T extends object> extends ProviderParameters<T> {
  didError: boolean;
  valueFromCondition: any;
  didReceiveFromLastCondition: boolean;
  passToNextCondition(value: any): void;
}

export type RunCondition<T extends object> = (
  parameters: RunConditionParameters<T>,
) => boolean;
