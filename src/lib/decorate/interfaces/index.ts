import { SurrogateMethodOptions, SurrogateCallback } from '../../interfaces';
import { Which } from '../../which';

export interface SurrogateDecoratorOptions<T extends object> {
  handler: SurrogateCallback<T> | SurrogateCallback<T>[];
  options?: SurrogateMethodOptions;
}

export type SurrogateDelegateOptions<T extends object> =
  | SurrogateCallback<T>
  | SurrogateCallback<T>[]
  | SurrogateDecoratorOptions<T>
  | SurrogateDecoratorOptions<T>[];

export interface NextHookOptions {
  action: string;
  condition?: Function;
  options?: SurrogateMethodOptions;
}

export interface NextForOptions extends NextHookOptions {
  type: Which;
}
