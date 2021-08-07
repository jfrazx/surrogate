import { SurrogateHandlerOptions } from './handlerOptions';
import { SurrogateHandlerContainer } from '../containers';
import { WhichContainers } from './whichContainers';
import { SurrogateHandlers } from './surrogate';
import { Which } from '../which';

export interface EventMap<T extends object> {
  [event: string]: WhichContainers<T>;
}

/**
 * @description Class that manages PRE and POST method handlers for Surrogate wrapped instances.
 *
 * @export
 * @interface SurrogateEventManager
 * @template T
 */
export interface SurrogateEventManager<T extends object> {
  /**
   * @description Removes all handlers for all methods
   *
   * @returns {SurrogateEventManager<T>}
   * @memberof SurrogateEventManager
   */
  deregisterHooks(): SurrogateEventManager<T>;

  /**
   * @description Removes all PRE handlers for the provided method
   *
   * @param {keyof T | string} event
   * @returns {SurrogateEventManager<T>}
   * @memberof SurrogateEventManager
   */
  deregisterPreHooks(event: keyof T | string): SurrogateEventManager<T>;
  /**
   * @description Removes all POST handlers for the provided method
   *
   * @param {keyof T | string} event
   * @returns {SurrogateEventManager<T>}
   * @memberof SurrogateEventManager
   */
  deregisterPostHooks(event: keyof T | string): SurrogateEventManager<T>;

  /**
   * @description Removes a specific PRE handler for the provided method
   *
   * @param {keyof T | string} event
   * @param {SurrogateHandlers<T>} handler
   * @returns {SurrogateEventManager<T>}
   * @memberof SurrogateEventManager
   */
  deregisterPreHook(
    event: keyof T | string,
    handler: SurrogateHandlers<T>,
  ): SurrogateEventManager<T>;

  /**
   * @description Removes a specific POST handler for the provided method
   *
   * @param {keyof T | string} event
   * @param {SurrogateHandlers<T>} handler
   * @returns {SurrogateEventManager<T>}
   * @memberof SurrogateEventManager
   */
  deregisterPostHook(
    event: keyof T | string,
    handler: SurrogateHandlers<T>,
  ): SurrogateEventManager<T>;

  /**
   * @description Retrieves all handlers in an event map
   *
   * @returns {EventMap<T>}
   * @memberof SurrogateEventManager
   */
  getEventMap(): EventMap<T>;

  /**
   * @description Retrieves all handlers for the provided method
   *
   * @param {keyof T | string} event
   * @returns {WhichContainers<T>}
   * @memberof SurrogateEventManager
   */
  getEventHandlers(event: keyof T | string): WhichContainers<T>;

  /**
   * @description Retrieves all PRE handlers for the provided method
   *
   * @param {keyof T | string} event
   * @returns {SurrogateHandlerContainer<T>}
   * @memberof SurrogateEventManager
   */
  getPreEventHandlers(event: keyof T | string): SurrogateHandlerContainer<T>[];

  /**
   * @description Retrieves all POST handlers for the provided method
   *
   * @param {keyof T | string} event
   * @returns {SurrogateHandlerContainer<T>}
   * @memberof SurrogateEventManager
   */
  getPostEventHandlers(event: keyof T | string): SurrogateHandlerContainer<T>[];

  /**
   * @description Registers a PRE handler or array of handlers for the provided method
   *
   * @param {keyof T | string} event
   * @param {(SurrogateHandlers<T>)} handler
   * @param {SurrogateHandlerOptions<T>} [options]
   * @returns {SurrogateEventManager<T>}
   * @memberof SurrogateEventManager
   */
  registerPreHook(
    event: keyof T | string,
    handler: SurrogateHandlers<T>,
    options?: SurrogateHandlerOptions<T>,
  ): SurrogateEventManager<T>;

  /**
   * @description Registers a POST handler or array of handlers for the provided method
   *
   * @param {keyof T | string} event
   * @param {(SurrogateHandlers<T>)} handler
   * @param {SurrogateHandlerOptions<T>} [options]
   * @returns {SurrogateEventManager<T>}
   * @memberof SurrogateEventManager
   */
  registerPostHook(
    event: keyof T | string,
    handler: SurrogateHandlers<T>,
    options?: SurrogateHandlerOptions<T>,
  ): SurrogateEventManager<T>;

  /**
   * @description Registers a PRE or POST handler for the provided method
   *
   * @param {keyof T | string} event
   * @param {Which} type
   * @param {(SurrogateHandlers<T>)} handler
   * @param {SurrogateHandlerOptions<T>} options
   * @returns {SurrogateEventManager<T>}
   * @memberof SurrogateEventManager
   */
  registerHook(
    event: keyof T | string,
    type: Which,
    handler: SurrogateHandlers<T>,
    options: SurrogateHandlerOptions<T>,
  ): SurrogateEventManager<T>;
}
