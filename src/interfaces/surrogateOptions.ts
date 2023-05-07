import type { Contexts, ShouldSilence } from './contexts';
import type { RunOnError, RunOnBail } from './runOn';

/**
 * Surrogate Options
 *
 * @export
 * @interface SurrogateOptions
 */
export interface SurrogateOptions extends SurrogateGlobalOptions {
  /**
   * @description Instructs Surrogate to operate as a Singleton
   * @default true
   * @type {boolean}
   * @memberof SurrogateOptions
   */
  useSingleton?: boolean;

  /**
   * @description Will force Surrogate to run specified methods with or without hooks.
   * @default false
   * @Type {boolean|string|string[]}
   * @memberof SurrogateOptions
   */
  maintainContext?: boolean | string | string[];
}

export interface SurrogateGlobalOptions {
  /**
   * @description Pass Next object to the Surrogate Handler
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
   * @description Specifies the context in which to call a handler. Method defined contexts take precedence.
   *
   * @options
   *  - instance
   *  - surrogate
   *  - user supplied context object
   *
   * @default instance
   * @type {Contexts}
   * @memberof SurrogateGlobalOptions
   */
  useContext?: Contexts;

  /**
   * @description Function to be called when an error is thrown. Will run even if errors are ignored.
   * @type {RunOnError|RunOnError[]}
   * @memberof SurrogateGlobalOptions
   */
  runOnError?: RunOnError | RunOnError[];

  /**
   * @description Function to be called when bailing out of a handler.
   * @type {RunOnBail|RunOnBail[]}
   * @memberof SurrogateGlobalOptions
   */
  runOnBail?: RunOnBail | RunOnBail[];

  /**
   * @description Provide content for Surrogate to pass to handlers and conditionals.
   * @type {any}
   * @memberof SurrogateGlobalOptions
   */
  provide?: any;

  /**
   * @description Ignore error output
   * @note If supplying a function a result of true will silence errors and false will allow output
   * @default false
   * @type {(boolean | ShouldSilence)}
   * @memberof SurrogateGlobalOptions
   */

  silenceErrors?: boolean | ShouldSilence;
}
