import type { Whichever } from '../../which';
import type {
  SurrogateOptions,
  SurrogateHandlers,
  SurrogateUnwrapped,
  SurrogateHandlerOptions,
} from '../../interfaces';

export type Constructor<T> = { new (...args: any[]): T };

export interface SurrogateDecorateOptions<T extends object> extends SurrogateOptions {
  locateWith?: Constructor<T>;
}

export interface SurrogateDecoratorOptions<T extends object> {
  options?: SurrogateHandlerOptions<T>;
  handler: SurrogateHandlers<T>;
}

export type SurrogateDelegateOptions<T extends object> =
  | SurrogateHandlers<T>
  | SurrogateDecoratorOptions<T>
  | SurrogateDecoratorOptions<T>[];

export interface SurrogateForOptions<T extends object> {
  options: SurrogateDelegateOptions<T>;
  type: Whichever;
}

export type Action<T extends object> =
  | keyof SurrogateUnwrapped<T>
  | (keyof SurrogateUnwrapped<T>)[]
  | string
  | string[];

export interface NextDecoratorOptions<T extends object> {
  options?: SurrogateHandlerOptions<T>;
  action: Action<T>;
}

export interface NextForOptions<T extends object> extends NextDecoratorOptions<T> {
  type: Whichever;
}
