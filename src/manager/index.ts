import { HandlerContainer } from '../containers';
import { wrapDefaults } from '@status/defaults';
import { PRE, POST, Which } from '../which';
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

export class EventManager<T extends object = any> {
  private readonly events: EventMap<T> = wrapDefaults<EventMap<T>, WhichContainers<T>>({
    defaultValue: {
      [POST]: [],
      [PRE]: [],
    },
    setUndefined: true,
    shallowCopy: false,
  });

  getEventHandlers(event: Property): WhichContainers<T> {
    return this.events[event];
  }

  registerHook(
    event: Property,
    type: Which,
    handler: SurrogateHandler<T> | SurrogateHandler<T>[],
    options: SurrogateHandlerOptions<T>,
  ): EventManager<T> {
    return this.setEventHandlers(event, type, asArray(handler), options);
  }

  registerPreHook(
    event: Property,
    handler: SurrogateHandler<T> | SurrogateHandler<T>[],
    options?: SurrogateHandlerOptions<T>,
  ): EventManager<T> {
    return this.setEventHandlers(event, PRE, asArray(handler), options);
  }

  registerPostHook(
    event: Property,
    handler: SurrogateHandler<T> | SurrogateHandler<T>[],
    options?: SurrogateHandlerOptions<T>,
  ): EventManager<T> {
    return this.setEventHandlers(event, POST, asArray(handler), options);
  }

  private setEventHandlers(
    event: Property,
    type: Which,
    handlers: SurrogateHandler<T>[],
    options: SurrogateHandlerOptions<T> = {},
  ): EventManager<T> {
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
  ): EventManager<T> {
    this.getEventHandlers(event)[type] = containers;

    return this;
  }

  deregisterHooks(): EventManager<T> {
    Object.keys(this.events).forEach((event) => this.deregisterHooksFor(event));

    return this;
  }

  deregisterHooksFor(event: Property): EventManager<T> {
    return this.deregisterPreHooks(event).deregisterPostHooks(event);
  }

  deregisterPreHook(event: Property, handler: SurrogateHandler<T>): EventManager<T> {
    return this.deregisterHookFor(event, PRE, handler);
  }

  deregisterPostHook(event: Property, handler: SurrogateHandler<T>): EventManager<T> {
    return this.deregisterHookFor(event, POST, handler);
  }

  /**
   * Deregister all events and remove target from Surrogate
   * Returns an array of events that were being managed
   *
   * @returns {string[]}
   * @memberof EventManager
   */
  clearEvents(): string[] {
    const events = Object.keys(this.events);

    this.deregisterHooks();

    return events;
  }

  private deregisterHookFor(
    event: Property,
    which: Which,
    handlerToRemove: SurrogateHandler<T>,
  ): EventManager<T> {
    const containers = this.getEventHandlersFor(event, which);

    return this.setEventHandlersFor(
      event,
      which,
      containers.filter(({ handler }) => handler !== handlerToRemove),
    );
  }

  deregisterPostHooks(event: Property): EventManager<T> {
    return this.setEventHandlersFor(event, POST);
  }

  deregisterPreHooks(event: Property): EventManager<T> {
    return this.setEventHandlersFor(event, PRE);
  }
}
