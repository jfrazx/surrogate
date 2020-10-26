export type MethodWrapper = 'none' | 'observable' | 'async';

export interface SurrogateMethodOptions {
  useNext?: boolean;
  passErrors?: boolean;
  ignoreErrors?: boolean;
  passInstance?: boolean;
  wrapper?: MethodWrapper;
}
