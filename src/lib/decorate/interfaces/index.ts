import { SurrogateMethodOptions, SurrogateCallback } from '../../interfaces';
import { Whichever } from '../../which';

export interface SurrogateDecoratorOptions<T extends object> {
  handler: SurrogateCallback<T> | SurrogateCallback<T>[];
  options?: SurrogateMethodOptions<T>;
}

export type SurrogateDelegateOptions<T extends object> =
  | SurrogateCallback<T>
  | SurrogateCallback<T>[]
  | SurrogateDecoratorOptions<T>
  | SurrogateDecoratorOptions<T>[];

export interface NextHookOptions<T extends object> {
  action: string;
  condition?: Function;
  options?: SurrogateMethodOptions<T>;
}

export interface NextForOptions<T extends object> extends NextHookOptions<T> {
  type: Whichever;
}
