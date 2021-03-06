import { SurrogateHandlerOptions } from './handlerOptions';
import { SurrogateHandler } from './surrogateHandler';
import { WhichContainers } from './whichContainers';
import { Which } from '../which';

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
   * @param {keyof T} event
   * @returns {SurrogateEventManager<T>}
   * @memberof SurrogateEventManager
   */
  deregisterPreHooks(event: keyof T): SurrogateEventManager<T>;
  /**
   * @description Removes all POST handlers for the provided method
   *
   * @param {keyof T} event
   * @returns {SurrogateEventManager<T>}
   * @memberof SurrogateEventManager
   */
  deregisterPostHooks(event: keyof T): SurrogateEventManager<T>;
  /**
   * @description Removes a specific PRE handler for the provided method
   *
   * @param {keyof T} event
   * @param {SurrogateHandler<T>} handler
   * @returns {SurrogateEventManager<T>}
   * @memberof SurrogateEventManager
   */
  deregisterPreHook(event: keyof T, handler: SurrogateHandler<T>): SurrogateEventManager<T>;
  /**
   * @description Removes a specific POST handler for the provided method
   *
   * @param {keyof T} event
   * @param {SurrogateHandler<T>} handler
   * @returns {SurrogateEventManager<T>}
   * @memberof SurrogateEventManager
   */
  deregisterPostHook(event: keyof T, handler: SurrogateHandler<T>): SurrogateEventManager<T>;
  /**
   * @description Retrieves all handlers for the provided method
   *
   * @param {keyof T} event
   * @returns {WhichContainers<T>}
   * @memberof SurrogateEventManager
   */
  getEventHandlers(event: keyof T): WhichContainers<T>;
  /**
   * @description Registers a PRE handler or array of handlers for the provided method
   *
   * @param {keyof T} event
   * @param {(SurrogateHandler<T> | SurrogateHandler<T>[])} handler
   * @param {SurrogateHandlerOptions<T>} [options]
   * @returns {SurrogateEventManager<T>}
   * @memberof SurrogateEventManager
   */
  registerPreHook(
    event: keyof T,
    handler: SurrogateHandler<T> | SurrogateHandler<T>[],
    options?: SurrogateHandlerOptions<T>,
  ): SurrogateEventManager<T>;
  /**
   * @description Registers a POST handler or array of handlers for the provided method
   *
   * @param {keyof T} event
   * @param {(SurrogateHandler<T> | SurrogateHandler<T>[])} handler
   * @param {SurrogateHandlerOptions<T>} [options]
   * @returns {SurrogateEventManager<T>}
   * @memberof SurrogateEventManager
   */
  registerPostHook(
    event: keyof T,
    handler: SurrogateHandler<T> | SurrogateHandler<T>[],
    options?: SurrogateHandlerOptions<T>,
  ): SurrogateEventManager<T>;
  /**
   * @description Registers a PRE or POST handler for the provided method
   *
   * @param {keyof T} event
   * @param {Which} type
   * @param {(SurrogateHandler<T> | SurrogateHandler<T>[])} handler
   * @param {SurrogateHandlerOptions<T>} options
   * @returns {SurrogateEventManager<T>}
   * @memberof SurrogateEventManager
   */
  registerHook(
    event: keyof T,
    type: Which,
    handler: SurrogateHandler<T> | SurrogateHandler<T>[],
    options: SurrogateHandlerOptions<T>,
  ): SurrogateEventManager<T>;
}
