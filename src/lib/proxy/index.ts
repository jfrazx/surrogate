import { SurrogateOptions, Surrogate, MethodWrapper, Property } from '../interfaces';
import { Next, ExecutionContext, Execution } from '../next';
import { containerGenerator, Tail } from '../containers';
import { SurrogateEventManager } from '../manager';
import { isFunction, isAsync } from '../helpers';
import { PRE, POST } from '../which';
import { Context } from '../context';

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
    receiver: Surrogate<T>,
  ): T[K] | SurrogateEventManager<T> | Handle {
    if (this.isGetSurrogate(event)) {
      return this.retrieveEventManager(target);
    }

    const original: T[K] = Reflect.get(target, event);

    if (!this.shouldProcess(target, original, event)) {
      return original;
    }

    return this.bindHandler(event, target, receiver);
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

  bindHandler(event: Property, target: T, receiver: Surrogate<T>) {
    const original = Reflect.get(target, event);

    if (!this.isHandlerBound(original)) {
      const context = Context.isAlreadyContextBound<T>(original)
        ? original()
        : new Context(target, receiver, event, original);

      Reflect.set(target, event, this.surrogateHandler.bind(this, context));
    }

    return Reflect.get(target, event);
  }

  surrogateHandler(context: Context<T>, ...args: any[]): any {
    return this.createExecutionContext(context, args).start();
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

    const { [PRE]: pre, [POST]: post } = this.targets.get(target).getEventHandlers(event);

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

  private createExecutionContext(context: Context<T>, args: any[]): Execution<T> {
    const { target, event, original } = context;
    const { [PRE]: pre, [POST]: post } = this.targets.get(target).getEventHandlers(event);

    const hasAsync = [...pre, ...post].some(
      ({ handler, options }) => isAsync(handler) || options?.wrapper === MethodWrapper.Async,
    );
    const executionContext = ExecutionContext.for<T>(original, args, hasAsync);

    const preChain = Next.for(
      this,
      context,
      executionContext,
      containerGenerator(pre, Tail.for(PRE, args)),
    );
    const postChain = Next.for(
      this,
      context,
      executionContext,
      containerGenerator(post, Tail.for(POST)),
    );

    return executionContext.setHooks(preChain, postChain);
  }
}
