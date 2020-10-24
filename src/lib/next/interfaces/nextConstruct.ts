import { SurrogateProxy } from '../../surrogate-proxy';
import { SurrogateCallback } from '../../types';
import { Context } from '../../context';
import { INext } from './iNext';

export interface INextConstruct<T extends object> {
  new (
    proxy: SurrogateProxy<T>,
    context: Context<T>,
    iterator: Generator<SurrogateCallback<T>, SurrogateCallback<T>>,
    callback?: SurrogateCallback<T>,
  ): INext<T>;
}
