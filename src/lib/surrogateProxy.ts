import { SurrogateEventManager } from './surrogateEventManager';
import { SurrogateOptions, Surrogate } from './interfaces';
import { Property } from './interfaces/property';
import { PRE_HOOK, POST_HOOK } from './which';
import { Next, NextChain } from './next';
import { isFunction } from './helpers';
import { Container } from './container';
import { Context } from './context';

type Handle = (...args: any[]) => any;
type Target<T extends object> = WeakMap<any, SurrogateEventManager<T>>;

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

  destroy(target: T): T {
    this.targets.delete(target);

    return target;
  }

  /**
   * Use an ES6 Proxy to wrap an Object with Surrogate as the handler.
   * Returns intersection of Object (T) and Surrogate
   *
   * @static
   * @template T
   * @param {T} object
   * @param {SurrogateOptions} [options]
   * @returns {Surrogate<T>}
   * @memberof SurrogateProxy
   */
  static wrap<T extends object>(object: T, options?: SurrogateOptions): Surrogate<T> {
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

  surrogateHandler(context: Context<T>, ...args: any[]): any {
    const chain = this.createNextChain(context, args);

    /**
     * @todo create execution context
     */
    return chain.start();
  }

  private isGetSurrogate(event: Property) {
    return event.toString() === 'getSurrogate';
  }

  private isHandlerBound(func: Function): boolean {
    return /bound\ssurrogateHandler/.test(func.name);
  }

  private retrieveEventManager(target: T) {
    return () => this.targets.get(target);
  }

  private shouldProcess(target: T, original: any, event: Property): original is Function {
    if (!isFunction(original) || Context.isAlreadyContextBound(original)) {
      return false;
    }

    const { [PRE_HOOK]: pre, [POST_HOOK]: post } = this.targets
      .get(target)
      .getEventHandlers(event);

    return Boolean(pre.length + post.length);
  }

  private setTarget(target: T): SurrogateProxy<T> {
    if (!this.targets.has(target)) {
      this.targets.set(target, new SurrogateEventManager(this, target));
    }

    return this;
  }

  private useInstance(useSingleton: boolean): SurrogateProxy<T> {
    if (useSingleton) {
      if (SurrogateProxy.instance) {
        return SurrogateProxy.instance;
      }

      SurrogateProxy.instance = this;
    }

    return this;
  }

  private createNextChain(context: Context<T>, args: any[]): NextChain<T> {
    const { target, event, original } = context;
    const { [PRE_HOOK]: pre, [POST_HOOK]: post } = this.targets
      .get(target)
      .getEventHandlers(event);

    const postChain = Next.for(this, context, POST_HOOK, this.containerGenerator(post));
    const preChain = Next.for(this, context, PRE_HOOK, this.containerGenerator(pre, original));

    return new NextChain(preChain, postChain, original, args);
  }

  private *containerGenerator(containers: Container<T>[], original?: Function) {
    for (const container of containers) {
      yield container;
    }

    return original ? new Container(original as any) : void 0;
  }
}
