import { SurrogateHandlerOptions, SurrogateHandler } from '../../interfaces';
import { Whichever } from '../../which';

export interface SurrogateDecoratorOptions<T extends object> {
  handler: SurrogateHandler<T> | SurrogateHandler<T>[];
  options?: SurrogateHandlerOptions<T>;
}

export type SurrogateDelegateOptions<T extends object> =
  | SurrogateHandler<T>
  | SurrogateHandler<T>[]
  | SurrogateDecoratorOptions<T>
  | SurrogateDecoratorOptions<T>[];

export interface SurrogateForOptions<T extends object> {
  type: Whichever;
  options: SurrogateDelegateOptions<T>;
}

export interface NextHookOptions<T extends object> {
  action: keyof T | (keyof T)[];
  options?: SurrogateHandlerOptions<T>;
}

export interface NextForOptions<T extends object> extends NextHookOptions<T> {
  type: Whichever;
}
