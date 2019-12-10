import { MethodWrapper } from '../types';

export interface SurrogateMethodOptions {
  wrapper?: MethodWrapper;
  useNext?: boolean;
  ignoreErrors?: boolean;
  passErrors?: boolean;
  passInstance?: boolean;
}
