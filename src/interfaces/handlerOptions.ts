import { SurrogateGlobalOptions } from './surrogateOptions';
import { ProviderParameters } from './provider';
import { RunCondition } from './runCondition';
import { MethodWrappers } from './contexts';
import { Surrogate } from './surrogate';
import { INext } from '../next';

/**
 *
 * @deprecated Use NextParameters
 * @export
 * @interface NextHandler
 * @extends {ProviderParameters<T>}
 * @template T
 */
export interface NextHandler<T extends object> extends ProviderParameters<T> {
  surrogate: Surrogate<T>;
  next: INext;
}

export interface NextParameters<T extends object> extends ProviderParameters<T> {
  surrogate: Surrogate<T>;
  next: INext;
}

export interface SurrogateHandlerOptions<T extends object> extends SurrogateGlobalOptions {
  /**
   * @description Pass Next object to the Surrogate Method
   *
   * @default true
   */
  useNext?: boolean;

  /**
   * @description Specify that nothing should be passed to handler
   *
   * @default false
   */
  noArgs?: boolean;

  /**
   * @description Should errors be thrown or ignored when passed via next()?
   *
   * @default false
   */
  ignoreErrors?: boolean;

  /**
   * @description Specifies the method context wrapper to utilize
   *
   * @options
   *  - none
   *  - async
   *
   * @default none
   */
  wrapper?: MethodWrappers;

  /**
   * @description Conditions to determine if a handler should be executed
   */
  runConditions?: RunCondition<T> | RunCondition<T>[];

  /**
   *
   * @description - Specify the priority of the handler.
   */
  priority?: number;
}
