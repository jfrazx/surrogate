import type { ProviderParameters } from './provider';

export interface RecoverableProvider<T extends object> extends ProviderParameters<T> {
  shouldRecover: boolean;
}
export interface RunOnErrorParameters<T extends object> extends RecoverableProvider<T> {
  error: Error;
  recoverFromError(recover: boolean): void;
}

export interface RunOnBailParameters<T extends object> extends RecoverableProvider<T> {
  bailWith(value: any): void;
  recoverFromBail(recover: boolean): void;
}

export type RunOnBail = <T extends object>(bailParameters: RunOnBailParameters<T>) => any;
export type RunOnError = <T extends object>(errorParameters: RunOnErrorParameters<T>) => any;
