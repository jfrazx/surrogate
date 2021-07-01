import { Whichever } from '../../which';
import {
  SurrogateHandler,
  SurrogateOptions,
  SurrogateUnwrapped,
  SurrogateHandlerOptions,
} from '../../interfaces';

export type Constructor<T> = { new (...args: any[]): T };

export interface SurrogateDecorateOptions<T extends object> extends SurrogateOptions {
  locateWith?: Constructor<T>;
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

export interface NextDecoratorOptions<T extends object> {
  action: keyof SurrogateUnwrapped<T> | (keyof SurrogateUnwrapped<T>)[] | string | string[];
  options?: SurrogateHandlerOptions<T>;
}

export interface NextForOptions<T extends object> extends NextDecoratorOptions<T> {
  type: Whichever;
}
