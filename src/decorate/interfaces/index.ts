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

export interface SurrogateDecoratorOptions<
  T extends object,
  Arguments extends Array<any> = any,
  Result = any,
> {
  options?: SurrogateHandlerOptions<T, Arguments, Result>;
  handler: SurrogateHandlers<T, Arguments, Result>;
}

export type SurrogateDelegateOptions<
  T extends object,
  Arguments extends Array<any> = any,
  Result = any,
> =
  | SurrogateHandlers<T, Arguments, Result>
  | SurrogateDecoratorOptions<T, Arguments, Result>
  | SurrogateDecoratorOptions<T, Arguments, Result>[];

export interface SurrogateForOptions<
  T extends object,
  Arguments extends Array<any> = any,
  Result = any,
> {
  options: SurrogateDelegateOptions<T, Arguments, Result>;
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
