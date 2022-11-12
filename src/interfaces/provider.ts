import type { SurrogateUnwrapped } from './surrogate';
import type { TimeTracker } from '../timeTracker';

export interface ProviderParameters<T extends object> {
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
   * @description Hook pipeline correlation id
   *
   * @note Sub hook pipelines receive a new correlation id
   *
   * @type {string}
   * @memberof ProviderParameters
   */
  correlationId: string;
  originalArgs: any[];
  receivedArgs: any[];
  currentArgs: any[];
  hookType: string;
  action: string;
  error?: Error;
  provide: any;
  result: any;
}
