import { SurrogateProxy } from '../surrogate';
import { SurrogateCallback } from '../types';
import { INext } from './inext.interface';
import { Context } from '../context';

export interface INextConstruct {
  new (
    proxy: SurrogateProxy<any>,
    context: Context<any>,
    iterator: Generator<SurrogateCallback, SurrogateCallback>,
    callback?: SurrogateCallback,
  ): INext;
}
