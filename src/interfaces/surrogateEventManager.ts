import { SurrogateHandlerOptions } from './handlerOptions';
import { SurrogateHandler } from './surrogateHandler';
import { WhichContainers } from './whichContainers';
import { Which } from '../which';

export interface ISurrogateEventManager<T extends object> {
  deregisterHooks(): ISurrogateEventManager<T>;
  deregisterPreHooks(event: keyof T): ISurrogateEventManager<T>;
  deregisterPostHooks(event: keyof T): ISurrogateEventManager<T>;
  deregisterPreHook(event: keyof T, handler: SurrogateHandler<T>): ISurrogateEventManager<T>;
  deregisterPostHook(event: keyof T, handler: SurrogateHandler<T>): ISurrogateEventManager<T>;
  getEventHandlers(event: keyof T): WhichContainers<T>;
  registerPreHook(
    event: keyof T,
    handler: SurrogateHandler<T> | SurrogateHandler<T>[],
    options?: SurrogateHandlerOptions<T>,
  ): ISurrogateEventManager<T>;
  registerPostHook(
    event: keyof T,
    handler: SurrogateHandler<T> | SurrogateHandler<T>[],
    options?: SurrogateHandlerOptions<T>,
  ): ISurrogateEventManager<T>;
  registerHook(
    event: keyof T,
    type: Which,
    handler: SurrogateHandler<T> | SurrogateHandler<T>[],
    options: SurrogateHandlerOptions<T>,
  ): ISurrogateEventManager<T>;
}
