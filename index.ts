import { asArray } from '@jfrazx/asarray';

const PRE_HOOK = Symbol('pre');
const POST_HOOK = Symbol('post');

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
   * @template K
   * @param {T} target
   * @param {(K | SurrogateEvents)} event
   * @param {T} receiver
   * @returns {(T[K] | T)}
   * @memberof SurrogateProxy
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
   * @param {SurrogateOptions} [options]
   * @returns {Surrogate<T>}
   * @memberof SurrogateProxy
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
   * @param {T} receiver
   * @param {SurrogateEvents} event
   * @returns {(void | SurrogateHandler<T>)}
   * @memberof SurrogateProxy
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
   * @param {Function} original
   * @param {string} event
   * @param {...any[]} args
   * @returns {*}
   * @memberof SurrogateProxy
   */
  private __handle(
    target: T,
    original: Function,
    event: string,
    ...args: any[]
  ): any {
    const progress = this.__pre(target, event, args);

    if (progress === false) {
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
   * @param {string} event
   * @returns {SurrogateProxy<T>}
   * @memberof SurrogateProxy
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
   * @param {string} event
   * @param {any[]} args
   * @returns
   * @memberof SurrogateProxy
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
   * @param {string} event
   * @param {any[]} args
   * @returns
   * @memberof SurrogateProxy
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
   * @param {SurrogateCallback<T>[]} events
   * @param {any[]} args
   * @returns {boolean}
   * @memberof SurrogateProxy
   */
  private __handleEvents(
    target: T,
    events: SurrogateCallback<T>[],
    args: any[]
  ): boolean {
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
   * @param {string} event
   * @param {symbol} which
   * @returns {SurrogateCallback<T>[]}
   * @memberof SurrogateProxy
   */
  private __getEventHandlers(
    target: T,
    event: string,
    which: symbol
  ): SurrogateCallback<T>[] {
    let result: SurrogateCallback<T>[] = [];

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
   * @param {string} event
   * @param {symbol} type
   * @param {SurrogateCallback<T>[]} handlers
   * @returns {T}
   * @memberof SurrogateProxy
   */
  private __setEventHandlers(
    target: T,
    event: string,
    type: symbol,
    handlers: SurrogateCallback<T>[]
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
   * @param {T} target
   * @param {string} event
   * @param {(SurrogateCallback<T> | SurrogateCallback<T>[])} handler
   * @returns {T}
   * @memberof SurrogateProxy
   */
  registerPreHook(
    target: T,
    event: string,
    handler: SurrogateCallback<T> | SurrogateCallback<T>[]
  ): T {
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
   * @param {T} target
   * @param {string} event
   * @param {(SurrogateCallback<T> | SurrogateCallback<T>[])} handler
   * @returns {T}
   * @memberof SurrogateProxy
   */
  registerPostHook(
    target: T,
    event: string,
    handler: SurrogateCallback<T> | SurrogateCallback<T>[]
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
    [which: string]: SurrogateCallback[];
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
 * @export
 * @interface Hooks
 * @template T
 */
export interface Hooks<T> {
  registerPreHook(event: string, handler: SurrogateCallback<T>): Surrogate<T>;
  registerPostHook(event: string, handler: SurrogateCallback<T>): Surrogate<T>;

  deregisterPreHook(event: string, handler: SurrogateCallback<T>): Surrogate<T>;
  deregisterPostHook(
    event: string,
    handler: SurrogateCallback<T>
  ): Surrogate<T>;
  deregisterHooksFor(event: string): Surrogate<T>;
}

/**
 * List of Surrogate Events
 */
export type SurrogateEvents =
  | 'registerPreHook'
  | 'registerPostHook'
  | 'deregisterPreHook'
  | 'deregisterPostHook'
  | 'deRegisterHookFor';

/**
 * Type returned from wrapper or SurrogateProxy.wrap
 */
export type Surrogate<T> = Hooks<T> & T;

/**
 *
 */
export type SurrogateCallback<T = any> = (self: T) => boolean;

/**
 * Internal Surrogate Handler
 *
 * @interface SurrogateHandler
 * @template T
 */
interface SurrogateHandler<T> {
  (method: string, ...args: any[]): T;
}

/**
 * Surrogate Options
 *
 * @export
 * @interface SurrogateOptions
 */
export interface SurrogateOptions {
  useSingleton?: boolean;
}

/**
 * Simple function to create a Surrogate wrapped object
 *
 * @export
 * @template T
 * @param {T} object
 * @param {SurrogateOptions} [options={}]
 * @returns {Surrogate<T>}
 */
export function wrapper<T extends object>(
  object: T,
  options: SurrogateOptions = {}
): Surrogate<T> {
  return SurrogateProxy.wrap(object, options);
}
