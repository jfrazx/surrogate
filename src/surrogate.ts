import { Defaults } from '@status/defaults';
import { asArray } from '@jfrazx/asarray';

import { PRE_HOOK, POST_HOOK } from './hooks';
import { Next, NextChain } from './next';
import { Container } from './container';
import { isFunction } from './helpers';
import { Context } from './context';
import {
  SurrogateMethodOptions,
  SurrogateEventHandler,
  SurrogateOptions,
  IEvent,
} from './interfaces';
import {
  Target,
  Surrogate,
  SurrogateCallback,
  SurrogateEvent,
  SurrogateEvents,
  Handle,
  Property,
  Which,
} from './types';

/**
 * Surrogate is a ProxyHandler aimed at providing simple pre and post hooks for object methods.
 *
 * @export
 * @class SurrogateProxy
 * @implements {ProxyHandler<T>}
 * @template T
 */
export class SurrogateProxy<T extends object> implements ProxyHandler<T> {
  private __targets: Target = new WeakMap();
  private static instance: SurrogateProxy<any>;
  private readonly suppressWarnings: boolean;

  constructor(target: T, options: SurrogateOptions = {}) {
    const { useSingleton = true, suppressWarnings = false } = options;
    const instance = this.__useInstance(useSingleton);

    this.suppressWarnings = suppressWarnings;

    return instance.__setTarget(target);
  }

  /**
   * Trap for property getters
   *
   * @template K
   * @param {T} target
   * @param {(K | SurrogateEvents)} event
   * @param {T} receiver
   * @returns {(T[K] | T | Handle)}
   * @memberof SurrogateProxy
   */
  get<K extends keyof T>(
    target: T,
    event: K | SurrogateEvents,
    receiver: Surrogate<T>,
  ): T[K] | SurrogateEventHandler<T> | Handle {
    if (!Reflect.has(target, event)) {
      return this.__targetSelf(target, receiver, event as SurrogateEvents);
    }

    const original: T[K] = Reflect.get(target, event);

    if (!this.__shouldProcess(target, original, event as Property)) {
      return original;
    }

    return this.setContext(
      target,
      event as Property,
      original,
      receiver,
    ).createRetrievableContext();
  }

  /**
   * Use an ES6 Proxy to wrap an Object with Surrogate as the handler.
   * Returns intersection of Object (T) and Hook methods
   *
   * @static
   * @template T
   * @param {T} object
   * @param {SurrogateOptions} [options]
   * @returns {Surrogate<T>}
   * @memberof SurrogateProxy
   */
  static wrap<T extends object>(
    object: T,
    options?: SurrogateOptions,
  ): Surrogate<T> {
    return new Proxy(object, new SurrogateProxy(object, options)) as Surrogate<T>;
  }

  private __shouldProcess(
    target: T,
    original: any,
    event: Property,
  ): original is Function {
    if (!isFunction(original) || Context.isAlreadyContextBound(original)) {
      return false;
    }

    const {
      [PRE_HOOK as any]: pre,
      [POST_HOOK as any]: post,
    } = this.__getEventHandlers(target, event);

    return Boolean(pre.length + post.length);
  }

  /**
   * PRIVATE METHODS
   */

  private setContext(
    target: T,
    event: Property,
    original: Function,
    receiver: Surrogate<T>,
  ) {
    return new Context(target, event, original, receiver);
  }

  /**
   * Targeting self enables wrapped objects to set up pre and post hooks.
   * The 'event' should only be 'registerPreHook' or 'registerPostHook'
   *
   * @private
   * @param {T} target
   * @param {Surrogate<T>} receiver
   * @param {SurrogateEvents} event
   * @returns {(SurrogateEventHandler<T>)}
   * @memberof SurrogateProxy
   */
  private __targetSelf(
    target: T,
    receiver: Surrogate<T>,
    event: SurrogateEvents,
  ): SurrogateEventHandler<T> {
    try {
      if (!Object.getPrototypeOf(this).hasOwnProperty(event.toString())) {
        throw new Error(`'${event}' does not exist on Target or Surrogate`);
      }
    } catch (e) {
      if (!this.suppressWarnings) {
        console.warn(
          `SurrogateError: An error occurred when targeting self: ${e.message}`,
        );
      }

      return Reflect.get(target, event, receiver);
    }

    // This function will be returned, allowing the passing of required arguments to register methods.
    // Passed information should be the name of the method (or the method(no anonymous functions)) on the wrapped object and
    // the function to run before or after said method
    return (method: SurrogateEvent, ...args: any[]): Surrogate<T> => {
      const name = this.__eventProperty(method, target, receiver);

      (this as any)[event](target, name, ...args);

      return receiver;
    };
  }

  private __eventProperty(
    method: SurrogateEvent,
    target: T,
    receiver: Surrogate<T>,
  ): Property {
    const event = isFunction(method) ? method.name : method;

    const context: Context<T> = this.setContext(
      target,
      event,
      Reflect.get(target, event),
      receiver,
    );

    Reflect.set(target, event, this.__handle.bind(this, context));

    return event;
  }

  /**
   *
   *
   * @private
   * @param {T} target
   * @returns {SurrogateProxy<T>}
   * @memberof SurrogateProxy
   */
  private __setTarget(target: T): SurrogateProxy<T> {
    if (!this.__targets.has(target)) {
      this.__targets.set(
        target,
        Defaults.wrap({
          defaultValue: {
            [PRE_HOOK]: [] as Container[],
            [POST_HOOK]: [] as Container[],
          },
          setUndefined: true,
          shallowCopy: false,
        }),
      );
    }

    return this;
  }

  /**
   *
   *
   * @private
   * @param {boolean} useSingleton
   * @returns {SurrogateProxy<T>}
   * @memberof SurrogateProxy
   */
  private __useInstance(useSingleton: boolean): SurrogateProxy<T> {
    if (useSingleton) {
      if (SurrogateProxy.instance) {
        return SurrogateProxy.instance;
      }

      SurrogateProxy.instance = this;
    }

    return this;
  }

  /**
   * Handle calling of pre/post hooks, and the original method
   *
   * @private
   * @param {Context<T>} context
   * @param {...any[]} args
   * @returns {*}
   * @memberof SurrogateProxy
   */
  private __handle(context: Context<T>, ...args: any[]): any {
    const chain = this.__createNextChain(context, args);

    /**
     * @todo create execution context
     */
    return chain.start();
  }

  private __createNextChain(context: Context<T>, args: any[]): NextChain {
    const { target, event, original } = context;
    const {
      [PRE_HOOK as any]: pre,
      [POST_HOOK as any]: post,
    } = this.__getEventHandlers(target, event);

    const postChain = Next.for(this, context, this.__containerGenerator(post));
    const preChain = Next.for(
      this,
      context,
      this.__containerGenerator(pre, original),
    );

    return new NextChain(preChain, postChain, original, args);
  }

  private *__containerGenerator(containers: Container[], original?: Function) {
    for (const container of containers) {
      yield container;
    }

    return original ? new Container(original as any) : void 0;
  }

  /**
   * Retrieve handlers for the current event.
   *
   * @private
   * @param {T} target
   * @param {Property} event
   * @param {symbol} which
   * @returns {Container[]}
   * @memberof SurrogateProxy
   */
  private __getEventHandlersFor(
    target: T,
    event: Property,
    which: Which,
  ): Container[] {
    return this.__getEventHandlers(target, event)[which as any];
  }

  private __getEventHandlers(target: T, event: Property) {
    return (this.__targets.get(target) as IEvent)[event];
  }

  /**
   * Set the handlers for the current event.
   *
   * @private
   * @param {T} target
   * @param {Property} event
   * @param {symbol} type
   * @param {SurrogateCallback[]} handlers
   * @returns {T}
   * @memberof SurrogateProxy
   */
  private __setEventHandlers(
    target: T,
    event: Property,
    type: Which,
    handlers: SurrogateCallback[],
    options: SurrogateMethodOptions = {},
  ): T {
    const eventHandlers: Container[] = this.__getEventHandlersFor(
      target,
      event,
      type,
    );

    for (const handler of handlers) {
      const container = new Container(handler, options);
      eventHandlers.push(container);
    }

    return target;
  }

  /**
   * This method is not accessed directly by the wrapped class, but called by targetSelf
   * and passed the appropriate information. That information being the target method
   * with a handler.
   *
   * @example
   *
   *  wrappedClass.registerPreHook('someMethod', () => {});
   *
   * @param {T} target
   * @param {Property} event
   * @param {(SurrogateCallback | SurrogateCallback[])} handler
   * @returns {T}
   * @memberof SurrogateProxy
   */
  registerPreHook(
    target: T,
    event: Property,
    handler: SurrogateCallback | SurrogateCallback[],
    options: SurrogateMethodOptions = {},
  ): T {
    return this.__setEventHandlers(
      target,
      event,
      PRE_HOOK,
      asArray(handler),
      options,
    );
  }

  /**
   * This method is not accessed directly by the wrapped class, but called by targetSelf
   * and passed the appropriate information. That information being the target method
   * with a handler.
   *
   * @example
   *
   *  wrappedClass.registerPostHook('someMethod', () => {});
   *
   *
   * @param {T} target
   * @param {Property} event
   * @param {(SurrogateCallback | SurrogateCallback[])} handler
   * @param {SurrogateMethodOptions} [options={}]
   * @returns {T}
   * @memberof SurrogateProxy
   */
  registerPostHook(
    target: T,
    event: Property,
    handler: SurrogateCallback | SurrogateCallback[],
    options: SurrogateMethodOptions = {},
  ): T {
    return this.__setEventHandlers(
      target,
      event,
      POST_HOOK,
      asArray(handler),
      options,
    );
  }

  deregisterHooksFor(target: T) {
    const iEvents = this.__targets.get(target);
    const events = Object.keys(iEvents);
    this.deregisterPreHook(target, events);
    this.deregisterPostHook(target, events);
  }

  deregisterPreHooksFor(target: T) {
    const iEvents = this.__targets.get(target);
    const events = Object.keys(iEvents);
    this.deregisterPreHook(target, events);
  }

  deregisterPostHooksFor(target: T) {
    const iEvents = this.__targets.get(target);
    const events = Object.keys(iEvents);
    this.deregisterPostHook(target, events);
  }

  deregisterPreHook(target: T, events: Property | Property[]) {
    const iEvent = this.__targets.get(target);
    asArray(events).forEach(event =>
      this.__deregister(target, iEvent, event, PRE_HOOK),
    );
  }

  deregisterPostHook(target: T, events: Property | Property[]) {
    const iEvent = this.__targets.get(target);
    asArray(events).forEach(event =>
      this.__deregister(target, iEvent, event, POST_HOOK),
    );
  }

  destroy(target: T): void {
    this.deregisterHooksFor(target);
    this.__targets.delete(target);
  }

  private __deregister<K extends keyof T>(
    target: T,
    iEvent: IEvent,
    event: Property | K,
    which: Symbol,
  ) {
    iEvent[event as Property][which as any] = [];
    const bound: any = target[event as K];

    if (Context.isAlreadyContextBound(bound)) {
      bound().resetContext();
    }
  }
}
