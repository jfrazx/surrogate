import { Unwrapped } from './hooks';

export type MethodWrapper = 'none' | 'observable' | 'async';

export type RunCondition<T extends object> = (instance: Unwrapped<T>) => boolean;

export interface SurrogateMethodOptions<T extends object = any> {
  useNext?: boolean;
  passErrors?: boolean;
  ignoreErrors?: boolean;
  passInstance?: boolean;
  wrapper?: MethodWrapper;
  runConditions?: RunCondition<T> | RunCondition<T>[];
}
