import { Whichever } from '../../which';
import {
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
  handler: SurrogateHandlers<T>;
  options?: SurrogateHandlerOptions<T>;
}

export type SurrogateDelegateOptions<T extends object> =
  | SurrogateHandlers<T>
  | SurrogateDecoratorOptions<T>
  | SurrogateDecoratorOptions<T>[];

export interface SurrogateForOptions<T extends object> {
  type: Whichever;
  options: SurrogateDelegateOptions<T>;
}

export interface NextDecoratorOptions<T extends object> {
  action: keyof SurrogateUnwrapped<T> | (keyof SurrogateUnwrapped<T>)[] | string | string[];
  options?: SurrogateHandlerOptions<T>;
}

export interface NextForOptions<T extends object> extends NextDecoratorOptions<T> {
  type: Whichever;
}
