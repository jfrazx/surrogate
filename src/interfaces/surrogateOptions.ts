import { Contexts } from './handlerOptions';

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
   * @description Defines a global context for use with all handlers and methods. Method defined contexts take precedence.
   * @default instance
   * @type {Contexts}
   * @memberof SurrogateOptions
   */
  useContext?: Contexts;
}
