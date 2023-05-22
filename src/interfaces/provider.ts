import type { SurrogateUnwrapped } from './surrogate';
import type { TimeTracker } from '../timeTracker';

export interface ProviderParameters<T extends object, Arguments, Result> {
  /**
   * @description The current, unwrapped instance
   *
   * @note Being unwrapped it does not have access to Surrogate methods and no hooks will run
   *
   * @type {SurrogateUnwrapped<T>}
   * @memberof ProviderParameters
   */
  instance: SurrogateUnwrapped<T>;

  /**
   * @description The current hook pipeline time tracker
   *
   * @type {TimeTracker}
   * @memberof ProviderParameters
   */
  timeTracker: TimeTracker;

  /**
   * @description Arguments passed to called method
   *
   * @type {Arguments}
   * @memberof ProviderParameters
   */
  originalArgs: Arguments;

  /**
   * @description Hook pipeline correlation id
   *
   * @note Sub hook pipelines receive a new correlation id
   *
   * @type {string}
   * @memberof ProviderParameters
   */
  correlationId: string;

  /**
   * @description The method name of the current hook pipeline
   *
   * @type {string}
   * @memberof ProviderParameters
   */
  action: string;
  receivedArgs: any[];
  currentArgs: any[];

  /**
   * @description The hook type of the pipeline (pre|post)
   *
   * @type {string}
   * @memberof ProviderParameters
   */
  hookType: string;

  /**
   * @description The error thrown by the hook pipeline method invocation
   *
   * @type {Error}
   * @memberof ProviderParameters
   */
  error?: Error;

  /**
   * @description Any additional provided values to the hook pipeline
   *
   * @type {*}
   * @memberof ProviderParameters
   */
  provide: any;

  /**
   * @description The result of the current hook pipeline method invocation
   *
   * @type {T[keyof T]}
   * @memberof ProviderParameters
   */
  result: Result;
}
