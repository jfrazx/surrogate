import { WhichContainers, SurrogateMethodOptions, SurrogateCallback } from './interfaces';
import { PRE_HOOK, POST_HOOK, Which } from './which';
import { SurrogateProxy } from './surrogateProxy';
import { Property } from './interfaces/property';
import { HandlerContainer } from './container';
import { Defaults } from '@status/defaults';
import { asArray } from '@jfrazx/asarray';

export interface EventMap<T extends object> {
  [event: string]: WhichContainers<T>;
}

export class SurrogateEventManager<T extends object = any> {
  private readonly events: EventMap<T>;

  constructor(private readonly proxy: SurrogateProxy<T>, private readonly target: T) {
    this.events = Defaults.wrap<EventMap<T>, WhichContainers<T>>({
      defaultValue: {
        [PRE_HOOK]: [],
        [POST_HOOK]: [],
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
  getEventHandlers(event: Property): WhichContainers<T> {
    return this.events[event];
  }

  /**
   *
   *
   * @param {Property} event
   * @param {Which} type
   * @param {(SurrogateCallback<T> | SurrogateCallback<T>[])} handler
   * @param {SurrogateMethodOptions} [options={}]
   * @returns {SurrogateEventManager<T>}
   * @memberof SurrogateEventManager
   */
  registerHook(
    event: Property,
    type: Which,
    handler: SurrogateCallback<T> | SurrogateCallback<T>[],
    options: SurrogateMethodOptions = {},
  ): SurrogateEventManager<T> {
    return this.setEventHandlers(event, type, asArray(handler), options);
  }

  private setEventHandlers(
    event: Property,
    type: Which,
    handlers: SurrogateCallback<T>[],
    options: SurrogateMethodOptions = {},
  ): SurrogateEventManager<T> {
    const currentContainers: HandlerContainer<T>[] = this.getEventHandlersFor(event, type);
    const containers = handlers.map((handler) => new HandlerContainer(handler, type, options));
    const allContainers = [...currentContainers, ...containers];

    this.setEventHandlersFor(event, type, allContainers);

    return this;
  }

  private getEventHandlersFor(event: Property, which: Which): HandlerContainer<T>[] {
    return this.getEventHandlers(event)[which];
  }

  private setEventHandlersFor(
    event: Property,
    type: Which,
    containers: HandlerContainer<T>[] = [],
  ): SurrogateEventManager {
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
  ): SurrogateEventManager {
    return this.setEventHandlers(event, PRE_HOOK, asArray(handler), options);
  }

  /**
   * * Register a handler to be called after the chosen method
   *
   * @param {Property} event
   * @param {(SurrogateCallback<T> | SurrogateCallback<T>[])} handler
   * @param {SurrogateMethodOptions} [options]
   * @returns {SurrogateEventManager<T>}
   * @memberof SurrogateEventManager
   */
  registerPostHook(
    event: Property,
    handler: SurrogateCallback<T> | SurrogateCallback<T>[],
    options?: SurrogateMethodOptions,
  ): SurrogateEventManager<T> {
    return this.setEventHandlers(event, POST_HOOK, asArray(handler), options);
  }

  /**
   * Deregisters all handlers for all events
   *
   * @returns
   * @memberof SurrogateEventManager
   */
  deregisterHooks(): SurrogateEventManager {
    Object.keys(this.events).forEach((event) => this.deregisterHooksFor(event));

    return this;
  }

  /**
   * Deregister all handlers for a particular event
   *
   * @param {Property} event
   * @returns {SurrogateEventManager}
   * @memberof SurrogateEventManager
   */
  deregisterHooksFor(event: Property): SurrogateEventManager {
    return this.deregisterPreHooks(event).deregisterPostHooks(event);
  }

  /**
   * Deregister a pre handler for a particular event
   *
   * @param {Property} event
   * @param {SurrogateCallback} handler
   * @returns {SurrogateEventManager}
   * @memberof SurrogateEventManager
   */
  deregisterPreHook(event: Property, handler: SurrogateCallback<T>): SurrogateEventManager {
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
  deregisterPostHook(event: Property, handler: SurrogateCallback<T>): SurrogateEventManager {
    return this.deregisterHookFor(event, POST_HOOK, handler);
  }

  /**
   * Deregister all events and remove target from Surrogate
   * Returns the unwrapped object
   *
   * @returns {T}
   * @memberof SurrogateEventManager
   */
  dispose(): T {
    return this.deregisterHooks().proxy.destroy(this.target);
  }

  private deregisterHookFor(
    event: Property,
    which: Which,
    handlerToRemove: SurrogateCallback<T>,
  ): SurrogateEventManager {
    const containers = this.getEventHandlersFor(event, which);

    return this.setEventHandlersFor(
      event,
      which,
      containers.filter(({ handler }) => handler !== handlerToRemove),
    );
  }

  /**
   * Deregister all post handlers for the given event
   *
   * @param {Property} event
   * @returns {SurrogateEventManager}
   * @memberof SurrogateEventManager
   */
  deregisterPostHooks(event: Property): SurrogateEventManager {
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
