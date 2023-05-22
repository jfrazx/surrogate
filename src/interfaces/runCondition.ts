import type { ProviderParameters } from './provider';

export interface RunConditionParameters<
  T extends object,
  Arguments extends Array<any> = any,
  Result = any,
> extends ProviderParameters<T, Arguments, Result> {
  didError: boolean;
  valueFromCondition: any;
  didReceiveFromLastCondition: boolean;
  passToNextCondition(value: any): void;
}

export type RunCondition<
  T extends object,
  Arguments extends Array<any> = any,
  Result = any,
> = (parameters: RunConditionParameters<T, Arguments, Result>) => boolean;
