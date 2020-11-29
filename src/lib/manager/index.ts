import { HandlerContainer } from '../containers';
import { PRE, POST, Which } from '../which';
import { Defaults } from '@status/defaults';
import { SurrogateProxy } from '../proxy';
import { asArray } from '@jfrazx/asarray';
import {
  Property,
  WhichContainers,
  SurrogateHandler,
  SurrogateHandlerOptions,
} from '../interfaces';

export interface EventMap<T extends object> {
  [event: string]: WhichContainers<T>;
}

export class SurrogateEventManager<T extends object = any> {
  private readonly events: EventMap<T>;

  constructor(private readonly proxy: SurrogateProxy<T>, private readonly target: T) {
    this.events = Defaults.wrap<EventMap<T>, WhichContainers<T>>({
      wrap: Object.create(null),
      defaultValue: {
        [POST]: [],
        [PRE]: [],
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
   * @param {(SurrogateHandler<T> | SurrogateHandler<T>[])} handler
   * @param {SurrogateHandlerOptions<T>} [options={}]
   * @returns {SurrogateEventManager<T>}
   * @memberof SurrogateEventManager
   */
  registerHook(
    event: Property,
    type: Which,
    handler: SurrogateHandler<T> | SurrogateHandler<T>[],
    options: SurrogateHandlerOptions<T> = {},
  ): SurrogateEventManager<T> {
    return this.setEventHandlers(event, type, asArray(handler), options);
  }

  /**
   * Register a handler to be called before the chosen method
   *
   * @param {Property} event
   * @param {(SurrogateHandler<T> | SurrogateHandler<T>[])} handler
   * @param {SurrogateHandlerOptions<T>} [options]
   * @returns {SurrogateEventManager}
   * @memberof SurrogateEventManager
   */
  registerPreHook(
    event: Property,
    handler: SurrogateHandler<T> | SurrogateHandler<T>[],
    options?: SurrogateHandlerOptions<T>,
  ): SurrogateEventManager {
    return this.setEventHandlers(event, PRE, asArray(handler), options);
  }

  /**
   * * Register a handler to be called after the chosen method
   *
   * @param {Property} event
   * @param {(SurrogateHandler<T> | SurrogateHandler<T>[])} handler
   * @param {SurrogateHandlerOptions<T>} [options]
   * @returns {SurrogateEventManager<T>}
   * @memberof SurrogateEventManager
   */
  registerPostHook(
    event: Property,
    handler: SurrogateHandler<T> | SurrogateHandler<T>[],
    options?: SurrogateHandlerOptions<T>,
  ): SurrogateEventManager<T> {
    return this.setEventHandlers(event, POST, asArray(handler), options);
  }

  private setEventHandlers(
    event: Property,
    type: Which,
    handlers: SurrogateHandler<T>[],
    options: SurrogateHandlerOptions<T> = {},
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
   * @param {SurrogateHandler} handler
   * @returns {SurrogateEventManager}
   * @memberof SurrogateEventManager
   */
  deregisterPreHook(event: Property, handler: SurrogateHandler<T>): SurrogateEventManager {
    return this.deregisterHookFor(event, PRE, handler);
  }

  /**
   * Deregister a post handler for a particular event
   *
   * @param {Property} event
   * @param {SurrogateHandler} handler
   * @returns {SurrogateEventManager}
   * @memberof SurrogateEventManager
   */
  deregisterPostHook(event: Property, handler: SurrogateHandler<T>): SurrogateEventManager {
    return this.deregisterHookFor(event, POST, handler);
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
    handlerToRemove: SurrogateHandler<T>,
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
    return this.setEventHandlersFor(event, POST);
  }

  /**
   * Deregister all pre handlers for the given event
   *
   * @param {Property} event
   * @returns {SurrogateEventManager}
   * @memberof SurrogateEventManager
   */
  deregisterPreHooks(event: Property): SurrogateEventManager {
    return this.setEventHandlersFor(event, PRE);
  }
}
