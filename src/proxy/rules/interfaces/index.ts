import { Property, Surrogate } from '../../../interfaces';
import { SurrogateProxy } from '../../proxy';
export interface FetchRule {
  shouldHandle(): boolean;
  returnableValue(): any;
}

export interface FetchRuleConstruct<T extends object> {
  new (
    proxy: SurrogateProxy<T>,
    target: T,
    event: Property,
    receiver: Surrogate<T>,
  ): FetchRule;
}

export enum InternalMethods {
  EventManager = 'getSurrogate',
  Dispose = 'disposeSurrogate',
}
