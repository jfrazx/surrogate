import { INext } from '../next';
import { Unwrapped, Surrogate } from './surrogate';

type HandlerWithoutAny = (...args: any) => any;
type HandlerWithAll<T extends object> = (
  next: INext<T>,
  instance: Unwrapped<T>,
  surrogate: Surrogate<T>,
  ...args: any[]
) => any;
type HandlerWithAllError<T extends object> = (
  error: Error,
  next: INext<T>,
  instance: Unwrapped<T>,
  surrogate: Surrogate<T>,
  ...args: any[]
) => any;

type HandlerWithError = (error: Error, ...args: any) => any;
type HandlerWithNext<T extends object> = (next: INext<T>, ...args: any[]) => any;
type HandlerWithInstance<T extends object> = (instance: Unwrapped<T>, ...args: any[]) => any;
type HandlerWithSurrogate<T extends object> = (surrogate: Surrogate<T>, ...args: any[]) => any;

type HandlerWithNextError<T extends object> = (
  error: Error,
  next: INext<T>,
  ...args: any[]
) => any;
type HandlerWithInstanceError<T extends object> = (
  error: Error,
  instance: Unwrapped<T>,
  ...args: any[]
) => any;
type HandlerWithSurrogateError<T extends object> = (
  error: Error,
  surrogate: Surrogate<T>,
  ...args: any[]
) => any;

type HandlerWithNextInstance<T extends object> = (
  next: INext<T>,
  instance: Unwrapped<T>,
  ...args: any[]
) => any;
type HandlerWithNextInstanceError<T extends object> = (
  error: Error,
  next: INext<T>,
  instance: Unwrapped<T>,
  ...args: any[]
) => any;

type HandlerWithNextSurrogate<T extends object> = (
  next: INext<T>,
  surrogate: Surrogate<T>,
  ...args: any[]
) => any;
type HandlerWithNextSurrogateError<T extends object> = (
  error: Error,
  next: INext<T>,
  surrogate: Surrogate<T>,
  ...args: any[]
) => any;
type HandlerWithInstanceSurrogate<T extends object> = (
  instance: Unwrapped<T>,
  surrogate: Surrogate<T>,
  ...args: any[]
) => any;

type HandlerWithInstanceSurrogateError<T extends object> = (
  error: Error,
  instance: Unwrapped<T>,
  surrogate: Surrogate<T>,
  ...args: any[]
) => any;

/**
 * Possible Surrogate handler types
 */
export type SurrogateHandler<T extends object> =
  | HandlerWithoutAny
  | HandlerWithAll<T>
  | HandlerWithAllError<T>
  | HandlerWithError
  | HandlerWithNext<T>
  | HandlerWithNextError<T>
  | HandlerWithInstance<T>
  | HandlerWithInstanceError<T>
  | HandlerWithSurrogate<T>
  | HandlerWithSurrogateError<T>
  | HandlerWithNextInstance<T>
  | HandlerWithNextInstanceError<T>
  | HandlerWithNextSurrogate<T>
  | HandlerWithNextSurrogateError<T>
  | HandlerWithInstanceSurrogate<T>
  | HandlerWithInstanceSurrogateError<T>;
