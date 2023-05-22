import type { SurrogateGlobalOptions } from './surrogateOptions';
import type { ProviderParameters } from './provider';
import type { RunCondition } from './runCondition';
import type { MethodWrappers } from './contexts';
import type { Surrogate } from './surrogate';
import type { INext } from '../next';

/**
 *
 * @deprecated Use NextParameters
 * @export
 * @interface NextHandler
 * @extends {ProviderParameters<T>}
 * @template T
 */
export interface NextHandler<T extends object> extends NextParameters<T> {}

/**
 *
 * @export
 * @interface NextParameters
 * @extends {ProviderParameters<T>}
 * @template T
 */
export interface NextParameters<
  T extends object,
  Arguments extends Array<any> = any,
  Result = any,
> extends ProviderParameters<T, Arguments, Result> {
  surrogate: Surrogate<T>;
  next: INext;
}

export interface SurrogateHandlerOptions<
  T extends object,
  Arguments extends Array<any> = any,
  Result = any,
> extends SurrogateGlobalOptions {
  /**
   * @description Specifies the method context wrapper to utilize
   *
   * @options
   *  - sync
   *  - async
   *
   * @default sync
   */
  wrapper?: MethodWrappers;

  /**
   * @description Conditions to determine if a handler should be executed
   */
  runConditions?: RunCondition<T, Arguments, Result> | RunCondition<T, Arguments, Result>[];

  /**
   * @description - Specify the priority of the handler. Higher priority handlers are run first.
   *
   * @default 0
   */
  priority?: number;
}
