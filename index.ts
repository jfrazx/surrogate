const PRE_HOOK  = Symbol('pre');
const POST_HOOK = Symbol('post');

/**
 * I was hoping extending the Proxy class would make Surrogate methods 'appear' to exist on the wrapped object.
 * It is not currently working as anticipated.
 *
 * @interface Proxy
 * @template T
 */
interface Proxy<T> {
  registerPreHook<K extends keyof T>(event: K, handler: Function): T;
  registerPostHook<K extends keyof T>(event: K, handler: Function): T;
}

/**
 * Surrogate is a ProxyHandler aimed at providing simple pre and post hooks for object methods.
 *
 * @export
 * @class Surrogate
 * @implements {ProxyHandler<T>}
 * @template T
 */
export class Surrogate<T extends object> implements ProxyHandler<T> {
  private __targets: Target = new WeakMap();

  /**
   * Trap for property getters
   *
   * @template K
   * @param {T} target
   * @param {K} event
   * @param {Proxy<T>} receiver
   * @returns {T[K]}
   * @memberof Surrogate
   */
  get<K extends keyof (T)>(target: T, event: K, receiver: Proxy<T>): T[K] {
    if (!Reflect.has(target, event)) {
       return this.__targetSelf(target, receiver, <any>event);
    }

    const original: T[K] = Reflect.get(target, event);

    if (typeof original !== 'function') { return original; }

    return this.__handle.bind(this, target, original, event);
  }


  /**
   * PRIVATE METHODS
   */


  /**
   * Handle calling of pre/post hooks, and the original method
   *
   * @private
   * @template K
   * @param {T} target
   * @param {T[K]} original
   * @param {K} event
   * @param {...any[]} args
   * @returns {*}
   * @memberof Surrogate
   */
  private __handle<K extends keyof T>(target: T, original: T[K], event: K, ...args: any[]): any {
    const progress = this.__pre(target, event, args);

    if (progress === false) { return progress; }

    const result = (<Function>original).apply(target, args);

    this.__post(target, event, [result]);

    return result;
  }

  /**
   * Using target and event, sets up pre/post handler arrays
   *
   * @private
   * @template K
   * @param {T} target
   * @param {K} event
   * @returns {Surrogate<T>}
   * @memberof Surrogate
   */
  private __setTargetEvent<K extends keyof T>(target: T, event: K): Surrogate<T> {
    if (this.__targets.has(target)) {
      if ((<IEvent>this.__targets.get(target))[event]) {
        return this;
      }
    }
    else { this.__targets.set(target, Object.create(null)); }

    (<IEvent>this.__targets.get(target))[event] = { [PRE_HOOK]: [], [POST_HOOK]: [] };

    return this;
  }

  /**
   * Method will begin calling all pre handlers associated with current event.
   *
   * @private
   * @template K
   * @param {T} target
   * @param {K} event
   * @param {any[]} args
   * @returns
   * @memberof Surrogate
   */
  private __pre<K extends keyof T>(target: T, event: K, args: any[]) {
    return this.__handleEvents(
            target,
            this.__getEventHandlers(
              target,
              event,
              PRE_HOOK
            ),
            args
          );
  }

  /**
   * Method will begin calling all post handlers associated with current event.
   *
   * @private
   * @template K
   * @param {T} target
   * @param {K} event
   * @param {any[]} args
   * @returns
   * @memberof Surrogate
   */
  private __post<K extends keyof T>(target: T, event: K, args: any[]) {
    return this.__handleEvents(
            target,
            this.__getEventHandlers(
              target,
              event,
              POST_HOOK
            ),
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
  private __handleEvents(target: T, events: Function[], args: any[]): boolean | void {
    for (const handler of events) {
      const result = handler.apply(target, args);

      if (result === false) {
        return <boolean>result;
      }
    }
  }

  /**
   * Retrieve handlers for the current event.
   *
   * @private
   * @template K
   * @param {T} target
   * @param {K} event
   * @param {symbol} which
   * @returns {Function[]}
   * @memberof Surrogate
   */
  private __getEventHandlers<K extends keyof T>(target: T, event: K, which: symbol): Function[] {
    let result: Function[] = [];

    if (this.__targets.has(target)) {
      const events: IEvent = (<IEvent>this.__targets.get(target));
      if (events[event]) {
        result = events[event][which];
      }
    }

    return result;
  }


  /**
   * Targeting self enables wrapped objects to set up pre and post hooks.
   * The 'event' should only be 'registerPreHook' or 'registerPostHook'
   *
   * @private
   * @template K
   * @param {T} target
   * @param {K} event
   * @returns {() => T}
   * @memberof Surrogate
   */
  private __targetSelf<K extends keyof this>(target: T, receiver: Proxy<T>, event: K): void;
  private __targetSelf<K extends keyof this>(target: T, receiver: Proxy<T>, event: K): () => Proxy<T>;
  private __targetSelf<K extends keyof this>(target: T, receiver: Proxy<T>, event: K): any {
    try {
      if (!Object.getPrototypeOf(this).hasOwnProperty(event)) {
        return void 0;
      }
    } catch (e) {
      console.log(`warn: SurrogateError: An error occurred when targeting self: ${ e.message }`);
      return void 0;
    }

    // This function will be returned, allowing the passing of required arguments to register methods.
    // Passed information should be the name of the method (or the method(no anonymous functions)) on the wrapped object and
    // the function to run before or after said method
    return (method: Function | string, ...args: any[]): Proxy<T> => {
      if (typeof method === 'function') {
        method = method.name;
      }

      this[event](target, method, ...args);

      return receiver;
    };
  }

  /**
   * Set the handlers for the current event.
   *
   * @private
   * @template K
   * @param {T} target
   * @param {K} event
   * @param {symbol} type
   * @param {Function[]} handlers
   * @returns {T}
   * @memberof Surrogate
   */
  private __setEventHandlers<K extends keyof T>(target: T, event: K, type: symbol, handlers: Function[]): T {
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
   * @private
   * @template K
   * @param {T} target
   * @param {K} event
   * @param {Function | Function[]} handler
   * @returns {T}
   * @memberof Surrogate
   */
  private registerPreHook<K extends keyof T>(target: T, event: K, handler: Function | Function[]): T {
    return this.__setEventHandlers(
        target,
        event,
        PRE_HOOK,
        Array.isArray(handler) ?
          handler :
          [handler]
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
   * @private
   * @template K
   * @param {T} target
   * @param {K} event
   * @param {Function | Function[]} handler
   * @returns {T}
   * @memberof Surrogate
   */
  private registerPostHook<K extends keyof T>(target: T, event: K, handler: Function | Function[]): T {
    return this.__setEventHandlers(
        target,
        event,
        POST_HOOK,
        Array.isArray(handler) ?
          handler :
          [handler]
      );
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
