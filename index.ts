import { asArray } from '@jfrazx/asarray';

const PRE_HOOK = Symbol('pre');
const POST_HOOK = Symbol('post');

/**
 * Surrogate is a ProxyHandler aimed at providing simple pre and post hooks for object methods.
 *
 * @export
 * @class Surrogate
 * @implements {ProxyHandler<T>}
 * @template T
 */

export class SurrogateProxy<T extends object> implements ProxyHandler<T> {
  private __targets: Target = new WeakMap();
  private static instance: SurrogateProxy<any>;

  constructor(options: SurrogateOptions = { useSingleton: true }) {
    const { useSingleton } = options;

    if (useSingleton) {
      if (SurrogateProxy.instance) {
        return SurrogateProxy.instance;
      }

      SurrogateProxy.instance = this;
    }
  }

  /**
   * Trap for property getters
   *
   * @param {T} target
   * @param {K} event
   * @param {Proxy<T>} receiver
   * @returns {T[K]}
   * @memberof Surrogate
   */
  get<K extends keyof T>(
    target: T,
    event: K | SurrogateEvents,
    receiver: T
  ): T[K] | T {
    if (!Reflect.has(target, event)) {
      return this.__targetSelf(target, receiver, event as SurrogateEvents) as T;
    }

    const original: T[K] = Reflect.get(target, event);

    if (typeof original !== 'function') {
      return original;
    }

    return this.__handle.bind(this, target, original, event);
  }

  /**
   * Use an ES6 Proxy to wrap an Object with Surrogate as the handler.
   * Returns intersection of Object (T) and Hook methods
   *
   * @static
   * @template T
   * @param {T} object
   * @returns {(T & Hooks<T>)}
   * @memberof Surrogate
   */
  static wrap<T extends object>(
    object: T,
    options?: SurrogateOptions
  ): Surrogate<T> {
    return new Proxy(object, new SurrogateProxy(options)) as Surrogate<T>;
  }

  /**
   * PRIVATE METHODS
   */

  /**
   * Targeting self enables wrapped objects to set up pre and post hooks.
   * The 'event' should only be 'registerPreHook' or 'registerPostHook'
   *
   * @private
   * @param {T} target
   * @param {K} event
   * @returns {() => T}
   * @memberof Surrogate
   */
  private __targetSelf(
    target: T,
    receiver: T,
    event: SurrogateEvents
  ): void | SurrogateHandler<T> {
    try {
      if (!Object.getPrototypeOf(this).hasOwnProperty(event)) {
        throw new Error(`'${event}' does not exist on Target or Surrogate`);
      }
    } catch (e) {
      console.warn(
        `warn: SurrogateError: An error occurred when targeting self: ${
          e.message
        }`
      );
      return void 0;
    }

    // This function will be returned, allowing the passing of required arguments to register methods.
    // Passed information should be the name of the method (or the method(no anonymous functions)) on the wrapped object and
    // the function to run before or after said method
    return (method: string, ...args: any[]): T => {
      (this as any)[event](target, method, ...args);

      return receiver;
    };
  }

  /**
   * Handle calling of pre/post hooks, and the original method
   *
   * @private
   * @param {T} target
   * @param {T[K]} original
   * @param {K} event
   * @param {...any[]} args
   * @returns {*}
   * @memberof Surrogate
   */
  private __handle(
    target: T,
    original: Function,
    event: string,
    ...args: any[]
  ): any {
    const progress = this.__pre(target, event, args);

    if (!progress) {
      return progress;
    }

    const result = original.apply(target, args);

    this.__post(target, event, [result]);

    return result;
  }

  /**
   * Using target and event, sets up pre/post handler arrays
   *
   * @private
   * @param {T} target
   * @param {K} event
   * @returns {Surrogate<TProxy>}
   * @memberof Surrogate
   */
  private __setTargetEvent(target: T, event: string): SurrogateProxy<T> {
    if (this.__targets.has(target)) {
      if ((<IEvent>this.__targets.get(target))[event]) {
        return this;
      }
    } else {
      this.__targets.set(target, Object.create(null));
    }

    (<IEvent>this.__targets.get(target))[event] = {
      [PRE_HOOK]: [],
      [POST_HOOK]: [],
    };

    return this;
  }

  /**
   * Method will begin calling all pre handlers associated with current event.
   *
   * @private
   * @param {T} target
   * @param {K} event
   * @param {any[]} args
   * @returns
   * @memberof Surrogate
   */
  private __pre(target: T, event: string, args: any[]) {
    return this.__handleEvents(
      target,
      this.__getEventHandlers(target, event, PRE_HOOK),
      args
    );
  }

  /**
   * Method will begin calling all post handlers associated with current event.
   *
   * @private
   * @param {T} target
   * @param {K} event
   * @param {any[]} args
   * @returns
   * @memberof Surrogate
   */
  private __post(target: T, event: string, args: any[]) {
    return this.__handleEvents(
      target,
      this.__getEventHandlers(target, event, POST_HOOK),
      args
    );
  }

  /**
   * Calls all event hooks in the order in which they were created.
   * A handler that returns false will interrupt further handler executions.
   * Returned data does not cascade.
   *
   * @private
   * @param {T} target
   * @param {Function[]} events
   * @param {any[]} args
   * @returns {(boolean | void)}
   * @memberof Surrogate
   */
  private __handleEvents(target: T, events: Function[], args: any[]): boolean {
    for (const handler of events) {
      const result = handler.call(target, target, ...args);

      if (!result) {
        return <boolean>result;
      }
    }

    return true;
  }

  /**
   * Retrieve handlers for the current event.
   *
   * @private
   * @param {T} target
   * @param {K} event
   * @param {symbol} which
   * @returns {Function[]}
   * @memberof Surrogate
   */
  private __getEventHandlers(
    target: T,
    event: string,
    which: symbol
  ): Function[] {
    let result: Function[] = [];

    if (this.__targets.has(target)) {
      const events: IEvent = this.__targets.get(target) as IEvent;
      if (events[event]) {
        result = events[event][which as any];
      }
    }

    return result;
  }

  /**
   * Set the handlers for the current event.
   *
   * @private
   * @param {T} target
   * @param {symbol} type
   * @param {Function[]} handlers
   * @returns {T}
   * @memberof Surrogate
   */
  private __setEventHandlers(
    target: T,
    event: string,
    type: symbol,
    handlers: Function[]
  ): T {
    this.__setTargetEvent(target, event);
    const eventHandlers = this.__getEventHandlers(target, event, type);

    for (const handler of handlers) {
      eventHandlers.push(handler);
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
   *
   * @private
   * @param {T} target
   * @param {string} event
   * @param {(Function | Function[])} handler
   * @returns {T}
   * @memberof Surrogate
   */
  registerPreHook(target: T, event: string, handler: Function | Function[]): T {
    return this.__setEventHandlers(target, event, PRE_HOOK, asArray(handler));
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
   * @private
   * @param {T} target
   * @param {string} event
   * @param {(Function | Function[])} handler
   * @returns {T}
   * @memberof Surrogate
   */
  registerPostHook(
    target: T,
    event: string,
    handler: Function | Function[]
  ): T {
    return this.__setEventHandlers(target, event, POST_HOOK, asArray(handler));
  }
}

/**
 * Describes object holding events and their handlers
 *
 * @interface IEvent
 */
interface IEvent {
  [event: string]: {
    [which: string]: Function[];
  };
}

/**
 * Custom type for WeakMap containing target object and any object method hooks
 *
 * @type Target
 */
type Target = WeakMap<any, IEvent>;

/**
 * Interface containing Surrogate hooks
 *
 * @interface Hooks
 * @template T
 */
export interface Hooks<T> {
  registerPreHook(event: string, handler: Function): Surrogate<T>;
  registerPostHook(event: string, handler: Function): Surrogate<T>;

  deregisterPreHook(event: string, handler: Function): Surrogate<T>;
  deregisterPostHook(event: string, handler: Function): Surrogate<T>;
  deregisterHooksFor(event: string): Surrogate<T>;
}

export type SurrogateEvents =
  | 'registerPreHook'
  | 'registerPostHook'
  | 'deregisterPreHook'
  | 'deregisterPostHook'
  | 'deRegisterHookFor';

export type Surrogate<T> = Hooks<T> & T;

export type SurrogateCallback<T = any> = (self: T) => any;

interface SurrogateHandler<T> {
  (method: string, ...args: any[]): T;
}

export interface SurrogateOptions {
  useSingleton: boolean;
}

export function wrapper<T extends object>(object: T): Surrogate<T> {
  return SurrogateProxy.wrap(object);
}
