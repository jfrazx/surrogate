import { SurrogateHandlerOptions, SurrogateHandler, SurrogateOptions } from '../../interfaces';
import { Whichever } from '../../which';

export type Constructor<T> = { new (...args: any[]): T };

export interface SurrogateDecorateOptions<T extends object> extends SurrogateOptions {
  inherit?: Constructor<T>;
}

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
