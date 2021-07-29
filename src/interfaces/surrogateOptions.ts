import { Contexts } from './contexts';
import { RunOnError } from './runOn';

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
}
