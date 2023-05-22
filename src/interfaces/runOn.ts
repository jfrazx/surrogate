import type { ProviderParameters } from './provider';

export interface RecoverableProvider<
  T extends object,
  Arguments extends Array<any> = any,
  Result = any,
> extends ProviderParameters<T, Arguments, Result> {
  shouldRecover: boolean;
}
export interface RunOnErrorParameters<
  T extends object,
  Arguments extends Array<any> = any,
  Result = any,
> extends RecoverableProvider<T, Arguments, Result> {
  error: Error;
  recoverFromError(recover: boolean): void;
}

export interface RunOnBailParameters<
  T extends object,
  Arguments extends Array<any> = any,
  Result = any,
> extends RecoverableProvider<T, Arguments, Result> {
  bailWith(value: any): void;
  recoverFromBail(recover: boolean): void;
}

export type RunOnBail = <T extends object, Arguments extends Array<any> = any, Result = any>(
  bailParameters: RunOnBailParameters<T, Arguments, Result>,
) => any;
export type RunOnError = <T extends object, Arguments extends Array<any> = any, Result = any>(
  errorParameters: RunOnErrorParameters<T, Arguments, Result>,
) => any;
