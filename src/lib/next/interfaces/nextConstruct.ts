import { SurrogateProxy } from '../../surrogateProxy';
import { SurrogateCallback } from '../../interfaces';
import { Context } from '../../context';
import { INext } from './next';

export interface INextConstruct<T extends object> {
  new (
    proxy: SurrogateProxy<T>,
    context: Context<T>,
    iterator: Generator<SurrogateCallback<T>, void>,
    callback?: SurrogateCallback<T>,
  ): INext<T>;
}
