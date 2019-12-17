import { SurrogateProxy, Context } from '../lib';
import { SurrogateCallback } from '../types';
import { INext } from './inext.interface';

export interface INextConstruct {
  new (
    proxy: SurrogateProxy<any>,
    context: Context<any>,
    iterator: Generator<SurrogateCallback, SurrogateCallback>,
    callback?: SurrogateCallback,
  ): INext;
}
