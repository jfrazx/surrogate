import { RunOnError, RunOnBail } from './runOn';
import { Contexts } from './contexts';

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
}

export interface SurrogateGlobalOptions {
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
}
