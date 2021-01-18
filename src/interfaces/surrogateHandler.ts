import { SurrogateUnwrapped, Surrogate } from './surrogate';
import { INext } from '../next';

type HandlerWithoutAny = (...args: any[]) => any;
type HandlerWithAll<T extends object> = (
  next: INext<T>,
  instance: SurrogateUnwrapped<T>,
  surrogate: Surrogate<T>,
  ...args: any[]
) => any;
type HandlerWithAllError<T extends object> = (
  error: Error,
  next: INext<T>,
  instance: SurrogateUnwrapped<T>,
  surrogate: Surrogate<T>,
  ...args: any[]
) => any;

type HandlerWithError = (error: Error, ...args: any) => any;
type HandlerWithNext<T extends object> = (next: INext<T>, ...args: any[]) => any;
type HandlerWithInstance<T extends object> = (
  instance: SurrogateUnwrapped<T>,
  ...args: any[]
) => any;
type HandlerWithSurrogate<T extends object> = (surrogate: Surrogate<T>, ...args: any[]) => any;

type HandlerWithNextError<T extends object> = (
  error: Error,
  next: INext<T>,
  ...args: any[]
) => any;
type HandlerWithInstanceError<T extends object> = (
  error: Error,
  instance: SurrogateUnwrapped<T>,
  ...args: any[]
) => any;
type HandlerWithSurrogateError<T extends object> = (
  error: Error,
  surrogate: Surrogate<T>,
  ...args: any[]
) => any;

type HandlerWithNextInstance<T extends object> = (
  next: INext<T>,
  instance: SurrogateUnwrapped<T>,
  ...args: any[]
) => any;
type HandlerWithNextInstanceError<T extends object> = (
  error: Error,
  next: INext<T>,
  instance: SurrogateUnwrapped<T>,
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
  instance: SurrogateUnwrapped<T>,
  surrogate: Surrogate<T>,
  ...args: any[]
) => any;

type HandlerWithInstanceSurrogateError<T extends object> = (
  error: Error,
  instance: SurrogateUnwrapped<T>,
  surrogate: Surrogate<T>,
  ...args: any[]
) => any;

/**
 * @description Surrogate handler types
 */
export type SurrogateHandler<T extends object> =
  | HandlerWithAll<T>
  | HandlerWithAllError<T>
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
  | HandlerWithInstanceSurrogateError<T>
  | HandlerWithError
  | HandlerWithoutAny;
