import { SurrogateHandlerContainer } from '../containers';
import { wrapDefaults } from '@status/defaults';
import { PRE, POST, Which } from '../which';
import { OptionsHandler } from '../options';
import { asArray } from '@jfrazx/asarray';
import type {
  EventMap,
  WhichContainers,
  SurrogateOptions,
  SurrogateHandlers,
  SurrogateEventManager,
  SurrogateHandlerTypes,
  SurrogateHandlerOptions,
} from '../interfaces';

export class EventManager<T extends object = any> implements SurrogateEventManager<T> {
  private readonly events: EventMap<T> = wrapDefaults<EventMap<T>, WhichContainers<T>>({
    defaultValue: {
      [POST]: [],
      [PRE]: [],
    },
    setUndefined: true,
    shallowCopy: false,
  });

  constructor(public globalOptions: SurrogateOptions = {}) {}

  getEventMap() {
    return this.events;
  }

  getEventHandlers(event: string): WhichContainers<T> {
    return this.events[event];
  }

  getPreEventHandlers(event: string): SurrogateHandlerContainer<T>[] {
    return this.getEventHandlersFor(event, PRE);
  }

  getPostEventHandlers(event: string): SurrogateHandlerContainer<T>[] {
    return this.getEventHandlersFor(event, POST);
  }

  eventIsHandled(event: string): boolean {
    const { pre, post } = this.getEventHandlers(event);

    return Boolean(pre?.length + post?.length);
  }

  registerHook(
    event: string,
    type: Which,
    handler: SurrogateHandlers<T>,
    options: SurrogateHandlerOptions<T>,
  ): EventManager<T> {
    return this.setEventHandlers(event, type, asArray(handler), options);
  }

  registerPreHook(
    event: string,
    handler: SurrogateHandlers<T>,
    options?: SurrogateHandlerOptions<T>,
  ): EventManager<T> {
    return this.setEventHandlers(event, PRE, asArray(handler), options);
  }

  registerPostHook(
    event: string,
    handler: SurrogateHandlers<T>,
    options?: SurrogateHandlerOptions<T>,
  ): EventManager<T> {
    return this.setEventHandlers(event, POST, asArray(handler), options);
  }

  private setEventHandlers(
    event: string,
    type: Which,
    handlers: SurrogateHandlerTypes<T>[],
    options: SurrogateHandlerOptions<T> = {},
  ): EventManager<T> {
    const currentContainers: SurrogateHandlerContainer<T>[] = this.getEventHandlersFor(
      event,
      type,
    );

    const optionsHandler = new OptionsHandler({
      handler: options,
      global: this.globalOptions,
    });

    const containers = handlers.map(
      (handler) => new SurrogateHandlerContainer(handler, type, optionsHandler),
    );

    const combinedContainers = [...currentContainers, ...containers];

    this.setEventHandlersFor(event, type, combinedContainers);

    return this;
  }

  private getEventHandlersFor(event: string, which: Which): SurrogateHandlerContainer<T>[] {
    return this.getEventHandlers(event)[which];
  }

  private setEventHandlersFor(
    event: string,
    type: Which,
    containers: SurrogateHandlerContainer<T>[] = [],
  ): EventManager<T> {
    this.getEventHandlers(event)[type] = containers;

    return this;
  }

  deregisterHooks(): EventManager<T> {
    Object.keys(this.events).forEach((event: string) => this.deregisterHooksFor(event));

    return this;
  }

  deregisterHooksFor(event: string): EventManager<T> {
    return this.deregisterPreHooks(event).deregisterPostHooks(event);
  }

  deregisterPreHook(event: string, handler: SurrogateHandlers<T>): EventManager<T> {
    return this.deregisterHookType(event, PRE, handler);
  }

  deregisterPostHook(event: string, handler: SurrogateHandlers<T>): EventManager<T> {
    return this.deregisterHookType(event, POST, handler);
  }

  private deregisterHookType(
    event: string,
    which: Which,
    handlerToRemove: SurrogateHandlers<T>,
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
