import { Defaults } from '@status/defaults';
import { asArray } from '@jfrazx/asarray';

import { EventMap, WhichContainers, SurrogateMethodOptions } from '../interfaces';
import { Property, SurrogateCallback, Which } from '../types';
import { SurrogateProxy } from './surrogate-proxy';
import { PRE_HOOK, POST_HOOK } from './hooks';
import { Container } from './container';

export class SurrogateEventManager<T extends object = any> {
  private readonly events: EventMap;

  constructor(
    private readonly proxy: SurrogateProxy<T>,
    private readonly target: T,
  ) {
    this.events = Defaults.wrap({
      defaultValue: {
        [PRE_HOOK]: [] as Container[],
        [POST_HOOK]: [] as Container[],
      },
      setUndefined: true,
      shallowCopy: false,
    });
  }

  /**
   * Retrieve event handlers for a particular event
   *
   * @param {Property} event
   * @returns {WhichContainers}
   * @memberof SurrogateEventManager
   */
  getEventHandlers(event: Property): WhichContainers {
    return this.events[event];
  }

  /**
   *
   *
   * @private
   * @param {Property} event
   * @param {Which} type
   * @param {SurrogateCallback<T>[]} handlers
   * @param {SurrogateMethodOptions} [options={}]
   * @returns {SurrogateEventManager}
   * @memberof SurrogateEventManager
   */
  private setEventHandlers(
    event: Property,
    type: Which,
    handlers: SurrogateCallback<T>[],
    options: SurrogateMethodOptions = {},
  ): SurrogateEventManager {
    const eventHandlers: Container[] = this.getEventHandlersFor(event, type);

    const containers = handlers.reduce(
      (memo, handler) => [...memo, new Container(handler, options)],
      eventHandlers,
    );

    this.setEventHandlersFor(event, type, containers);
    this.proxy.bindHandler(event, this.target);

    return this;
  }

  /**
   *
   *
   * @private
   * @param {Property} event
   * @param {Which} which
   * @returns {Container[]}
   * @memberof SurrogateEventManager
   */
  private getEventHandlersFor(event: Property, which: Which): Container[] {
    return this.getEventHandlers(event)[which];
  }

  /**
   *
   *
   * @private
   * @param {Property} event
   * @param {Which} type
   * @param {Container[]} [containers=[]]
   * @returns {SurrogateEventManager}
   * @memberof SurrogateEventManager
   */
  private setEventHandlersFor(
    event: Property,
    type: Which,
    containers: Container[] = [],
  ) {
    this.getEventHandlers(event)[type] = containers;

    return this;
  }

  /**
   * Register a handler to be called before the chosen method
   *
   * @param {Property} event
   * @param {(SurrogateCallback<T> | SurrogateCallback<T>[])} handler
   * @param {SurrogateMethodOptions} [options]
   * @returns {SurrogateEventManager}
   * @memberof SurrogateEventManager
   */
  registerPreHook(
    event: Property,
    handler: SurrogateCallback<T> | SurrogateCallback<T>[],
    options?: SurrogateMethodOptions,
  ) {
    return this.setEventHandlers(event, PRE_HOOK, asArray(handler), options);
  }

  /**
   * * Register a handler to be called after the chosen method
   *
   * @param {Property} event
   * @param {(SurrogateCallback<T> | SurrogateCallback<T>[])} handler
   * @param {SurrogateMethodOptions} [options]
   * @returns {SurrogateEventManager}
   * @memberof SurrogateEventManager
   */
  registerPostHook(
    event: Property,
    handler: SurrogateCallback<T> | SurrogateCallback<T>[],
    options?: SurrogateMethodOptions,
  ) {
    return this.setEventHandlers(event, POST_HOOK, asArray(handler), options);
  }

  /**
   * Deregisters all handlers for all events
   *
   * @memberof SurrogateEventManager
   */
  deregisterHooks() {
    Object.keys(this.events).forEach((event) => this.deregisterHooksFor(event));
  }

  /**
   * Deregister all handlers for a particular event
   *
   * @param {Property} event
   * @returns {SurrogateEventManager}
   * @memberof SurrogateEventManager
   */
  deregisterHooksFor(event: Property) {
    this.deregisterPreHooks(event);
    return this.deregisterPostHooks(event);
  }

  /**
   * Deregister a pre handler for a particular event
   *
   * @param {Property} event
   * @param {SurrogateCallback} handler
   * @returns {SurrogateEventManager}
   * @memberof SurrogateEventManager
   */
  deregisterPreHook(event: Property, handler: SurrogateCallback<T>) {
    return this.deregisterHookFor(event, PRE_HOOK, handler);
  }

  /**
   * Deregister a post handler for a particular event
   *
   * @param {Property} event
   * @param {SurrogateCallback} handler
   * @returns {SurrogateEventManager}
   * @memberof SurrogateEventManager
   */
  deregisterPostHook(event: Property, handler: SurrogateCallback<T>) {
    return this.deregisterHookFor(event, POST_HOOK, handler);
  }

  /**
   * Deregister all events and remove target from Surrogate
   * Returns the unwrapped object
   *
   * @returns {T}
   * @memberof SurrogateEventManager
   */
  destroy(): T {
    this.deregisterHooks();
    return this.proxy.destroy(this.target);
  }

  /**
   *
   *
   * @private
   * @param {Property} event
   * @param {Which} which
   * @param {SurrogateCallback} handler
   * @returns {SurrogateEventManager}
   * @memberof SurrogateEventManager
   */
  private deregisterHookFor(
    event: Property,
    which: Which,
    handler: SurrogateCallback<T>,
  ) {
    const containers = this.getEventHandlersFor(event, which);

    return this.setEventHandlersFor(
      event,
      which,
      containers.filter(({ callback }) => callback !== handler),
    );
  }

  /**
   * Deregister all post handlers for the given event
   *
   * @param {Property} event
   * @returns {SurrogateEventManager}
   * @memberof SurrogateEventManager
   */
  deregisterPostHooks(event: Property) {
    return this.setEventHandlersFor(event, POST_HOOK);
  }

  /**
   * Deregister all pre handlers for the given event
   *
   * @param {Property} event
   * @returns {SurrogateEventManager}
   * @memberof SurrogateEventManager
   */
  deregisterPreHooks(event: Property): SurrogateEventManager {
    return this.setEventHandlersFor(event, PRE_HOOK);
  }
}
