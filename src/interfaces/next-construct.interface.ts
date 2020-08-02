import { SurrogateProxy, Context } from '../lib';
import { SurrogateCallback } from '../types';
import { INext } from './inext.interface';

export interface INextConstruct<T extends object> {
  new (
    proxy: SurrogateProxy<T>,
    context: Context<T>,
    iterator: Generator<SurrogateCallback<T>, SurrogateCallback<T>>,
    callback?: SurrogateCallback<T>,
  ): INext<T>;
}
