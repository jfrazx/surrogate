import type { ProviderParameters } from './provider';

export interface RecoverableProvider<T extends object, Arguments extends Array<any> = any>
  extends ProviderParameters<T, Arguments> {
  shouldRecover: boolean;
}
export interface RunOnErrorParameters<T extends object, Arguments extends Array<any> = any>
  extends RecoverableProvider<T, Arguments> {
  error: Error;
  recoverFromError(recover: boolean): void;
}

export interface RunOnBailParameters<T extends object, Arguments extends Array<any> = any>
  extends RecoverableProvider<T, Arguments> {
  bailWith(value: any): void;
  recoverFromBail(recover: boolean): void;
}

export type RunOnBail = <T extends object, Arguments extends Array<any> = any>(
  bailParameters: RunOnBailParameters<T, Arguments>,
) => any;
export type RunOnError = <T extends object, Arguments extends Array<any> = any>(
  errorParameters: RunOnErrorParameters<T, Arguments>,
) => any;
