import { SurrogateProxy } from '../../surrogateProxy';
import { SurrogateCallback } from '../../interfaces';
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
