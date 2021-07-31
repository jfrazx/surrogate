import { HandlerContainer } from '../containers';
import { wrapDefaults } from '@status/defaults';
import { PRE, POST, Which } from '../which';
import { OptionsHandler } from '../options';
import { asArray } from '@jfrazx/asarray';
import {
  WhichContainers,
  SurrogateHandler,
  SurrogateEventManager,
  SurrogateGlobalOptions,
  SurrogateHandlerOptions,
} from '../interfaces';

interface EventMap<T extends object> {
  [event: string]: WhichContainers<T>;
}

export class EventManager<T extends object = any> implements SurrogateEventManager<T> {
  private readonly events: EventMap<T> = wrapDefaults<EventMap<T>, WhichContainers<T>>({
    defaultValue: {
      [POST]: [],
      [PRE]: [],
    },
    setUndefined: true,
    shallowCopy: false,
  });

  constructor(private globalOptions: SurrogateGlobalOptions) {}

  getEventHandlers(event: string): WhichContainers<T> {
    return this.events[event];
  }

  registerHook(
    event: string,
    type: Which,
    handler: SurrogateHandler<T> | SurrogateHandler<T>[],
    options: SurrogateHandlerOptions<T>,
  ): EventManager<T> {
    return this.setEventHandlers(event, type, asArray(handler), options);
  }

  registerPreHook(
    event: string,
    handler: SurrogateHandler<T> | SurrogateHandler<T>[],
    options?: SurrogateHandlerOptions<T>,
  ): EventManager<T> {
    return this.setEventHandlers(event, PRE, asArray(handler), options);
  }

  registerPostHook(
    event: string,
    handler: SurrogateHandler<T> | SurrogateHandler<T>[],
    options?: SurrogateHandlerOptions<T>,
  ): EventManager<T> {
    return this.setEventHandlers(event, POST, asArray(handler), options);
  }

  private setEventHandlers(
    event: string,
    type: Which,
    handlers: SurrogateHandler<T>[],
    options: SurrogateHandlerOptions<T> = {},
  ): EventManager<T> {
    const currentContainers: HandlerContainer<T>[] = this.getEventHandlersFor(event, type);
    const containers = handlers.map(
      (handler) =>
        new HandlerContainer(
          handler,
          type,
          new OptionsHandler({ handler: options, global: this.globalOptions }),
        ),
    );
    const allContainers = [...currentContainers, ...containers];

    this.setEventHandlersFor(event, type, allContainers);

    return this;
  }

  private getEventHandlersFor(event: string, which: Which): HandlerContainer<T>[] {
    return this.getEventHandlers(event)[which];
  }

  private setEventHandlersFor(
    event: string,
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

  deregisterHooksFor(event: string): EventManager<T> {
    return this.deregisterPreHooks(event).deregisterPostHooks(event);
  }

  deregisterPreHook(event: string, handler: SurrogateHandler<T>): EventManager<T> {
    return this.deregisterHookType(event, PRE, handler);
  }

  deregisterPostHook(event: string, handler: SurrogateHandler<T>): EventManager<T> {
    return this.deregisterHookType(event, POST, handler);
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

  private deregisterHookType(
    event: string,
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

  deregisterPostHooks(event: string): EventManager<T> {
    return this.setEventHandlersFor(event, POST);
  }

  deregisterPreHooks(event: string): EventManager<T> {
    return this.setEventHandlersFor(event, PRE);
  }
}
