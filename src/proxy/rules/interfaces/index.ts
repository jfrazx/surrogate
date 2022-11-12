import type { Surrogate, ShouldHandle } from '../../../interfaces';
import type { SurrogateProxy } from '../../handler';

export interface FetchRule extends ShouldHandle {
  returnableValue(): any;
}

export interface FetchRuleConstruct<T extends object> {
  new (proxy: SurrogateProxy<T>, target: T, event: string, receiver: Surrogate<T>): FetchRule;
}

export enum InternalMethods {
  EventManager = 'getSurrogate',
  Dispose = 'disposeSurrogate',
  Bypass = 'bypassSurrogate',
}
