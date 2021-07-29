import { ProviderParameters } from './provider';

export interface RunOnErrorParameters<T extends object> extends ProviderParameters<T> {
  error: Error;
}

export type RunOnError = <T extends object>(errorParameters: RunOnErrorParameters<T>) => void;
