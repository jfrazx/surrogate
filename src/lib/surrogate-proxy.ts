import { Target, Surrogate, Handle, Property } from '../types';
import { SurrogateEventManager } from './surrogate-event-manager';
import { SurrogateOptions } from '../interfaces';
import { PRE_HOOK, POST_HOOK } from './hooks';
import { Next, NextChain } from '../next';
import { Container } from './container';
import { isFunction } from '../helpers';
import { Context } from './context';

/**
 * Surrogate is a ProxyHandler aimed at providing simple pre and post hooks for object methods.
 *
 * @export
 * @class SurrogateProxy
 * @implements {ProxyHandler<T>}
 * @template T
 */
export class SurrogateProxy<T extends object> implements ProxyHandler<T> {
  private targets: Target<T> = new WeakMap();
  private static instance: SurrogateProxy<any>;

  constructor(target: T, { useSingleton = true }: SurrogateOptions = {}) {
    const instance = this.useInstance(useSingleton);

    return instance.setTarget(target);
  }

  /**
   * Trap for property getters
   *
   * @template K
   * @param {T} target
   * @param {(K | SurrogateEvents)} event
   * @returns {(T[K] | T | Handle)}
   * @memberof SurrogateProxy
   */
  get<K extends keyof T>(
    target: T,
    event: Property,
  ): T[K] | SurrogateEventManager<T> | Handle {
    if (this.isGetSurrogate(event)) {
      return this.retrieveEventManager(target);
    }

    const original: T[K] = Reflect.get(target, event);

    if (!this.shouldProcess(target, original, event)) {
      return original;
    }

    return this.bindHandler(event, target);
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

  bindHandler(event: Property, target: T) {
    const original = Reflect.get(target, event);

    if (!this.isHandlerBound(original)) {
      const context = Context.isAlreadyContextBound<T>(original)
        ? original()
        : new Context(target, event, original);

      Reflect.set(target, event, this.surrogateHandler.bind(this, context));
    }

    return Reflect.get(target, event);
  }

  isBound(func: Function) {
    return this.isHandlerBound(func) || Context.isAlreadyContextBound(func);
  }

  /**
   * Handle calling of pre/post hooks, and the original method
   *
   * @param {Context<T>} context
   * @param {...any[]} args
   * @returns {*}
   * @memberof SurrogateProxy
   */
  surrogateHandler(context: Context<T>, ...args: any[]): any {
    const chain = this.createNextChain(context, args);

    /**
     * @todo create execution context
     */
    return chain.start();
  }

  /**
   * PRIVATE METHODS
   */

  private isGetSurrogate(event: Property) {
    return event.toString() === 'getSurrogate';
  }

  private isHandlerBound(func: Function): boolean {
    return /bound\ssurrogateHandler/.test(func.name);
  }

  private retrieveEventManager(target: T) {
    return () => this.targets.get(target);
  }

  private shouldProcess(
    target: T,
    original: any,
    event: Property,
  ): original is Function {
    if (!isFunction(original) || Context.isAlreadyContextBound(original)) {
      return false;
    }

    const { [PRE_HOOK]: pre, [POST_HOOK]: post } = this.targets
      .get(target)
      .getEventHandlers(event);

    return Boolean(pre.length + post.length);
  }

  /**
   *
   *
   * @private
   * @param {T} target
   * @returns {SurrogateProxy<T>}
   * @memberof SurrogateProxy
   */
  private setTarget(target: T): SurrogateProxy<T> {
    if (!this.targets.has(target)) {
      this.targets.set(target, new SurrogateEventManager(this, target));
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
  private useInstance(useSingleton: boolean): SurrogateProxy<T> {
    if (useSingleton) {
      if (SurrogateProxy.instance) {
        return SurrogateProxy.instance;
      }

      SurrogateProxy.instance = this;
    }

    return this;
  }

  private createNextChain(context: Context<T>, args: any[]): NextChain {
    const { target, event, original } = context;
    const { [PRE_HOOK]: pre, [POST_HOOK]: post } = this.targets
      .get(target)
      .getEventHandlers(event);

    const postChain = Next.for(this, context, this.containerGenerator(post));
    const preChain = Next.for(this, context, this.containerGenerator(pre, original));

    return new NextChain(preChain, postChain, original, args);
  }

  private *containerGenerator(containers: Container[], original?: Function) {
    for (const container of containers) {
      yield container;
    }

    return original ? new Container(original as any) : void 0;
  }

  destroy(target: T): T {
    this.targets.delete(target);

    return target;
  }
}
