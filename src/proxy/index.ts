import { Property, Surrogate, MethodWrapper, SurrogateOptions } from '../interfaces';
import { containerGenerator, Tail, HandlerContainer } from '../containers';
import { isFunction, isAsync, isUndefined } from '../helpers';
import { Context, BoundContext } from '../context';
import { SurrogateEventManager } from '../manager';
import { Next, ExecutionContext } from '../next';
import { PRE, POST } from '../which';

type Target<T extends object> = WeakMap<any, SurrogateEventManager<T>>;
type Handle = (...args: any[]) => any;

enum InternalMethods {
  EventManager = 'getSurrogate',
  Dispose = 'disposeSurrogate',
}

export class SurrogateProxy<T extends object> implements ProxyHandler<T> {
  private targets: Target<T> = new WeakMap();
  private static instance: SurrogateProxy<any>;

  constructor(target: T, { useSingleton = true }: SurrogateOptions) {
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

    if (this.isDisposeSurrogate(event)) {
      return this.retrieveDispose(target);
    }

    const original: T[K] = Reflect.get(target, event);

    if (!this.shouldProcess(target, original, event)) {
      return original;
    }

    return this.bindHandler(event, target, receiver);
  }

  static wrap<T extends object>(object: T, options?: SurrogateOptions): Surrogate<T> {
    return new Proxy(object, new SurrogateProxy(object, options)) as Surrogate<T>;
  }

  bindHandler(event: Property, target: T, receiver: Surrogate<T>) {
    const func = Reflect.get(target, event);

    if (!this.isHandlerBound(func)) {
      const context = Context.isAlreadyContextBound<T>(func)
        ? func()
        : new Context(target, receiver, event, func);

      Reflect.set(target, event, this.surrogateHandler.bind(this, context));
    }

    return Reflect.get(target, event);
  }

  private surrogateHandler(context: Context<T>, ...args: any[]): any {
    const { target, event, original } = context;
    const { [PRE]: pre, [POST]: post } = this.targets.get(target).getEventHandlers(event);
    const { hasAsync, resetContext } = this.initializeContextOptions([...pre, ...post]);

    const executionContext = ExecutionContext.for<T>(original, args, hasAsync, resetContext);

    Next.for(this, context, executionContext, containerGenerator(pre, Tail.for(PRE, args)));
    Next.for(this, context, executionContext, containerGenerator(post, Tail.for(POST)));

    return executionContext.start();
  }

  private initializeContextOptions(handlers: HandlerContainer<T>[]) {
    const hasAsync = handlers.some(
      ({ handler, options }) => isAsync(handler) || options?.wrapper === MethodWrapper.Async,
    );
    const resetContext = handlers.every(({ options }) => options?.resetContext);

    return {
      hasAsync,
      resetContext,
    };
  }

  private isHandlerBound(func: Function): boolean {
    return /bound\ssurrogateHandler/.test(func.name);
  }

  private isGetSurrogate(event: Property) {
    return event.toString() === InternalMethods.EventManager;
  }

  private isDisposeSurrogate(event: Property) {
    return event.toString() === InternalMethods.Dispose;
  }

  private retrieveEventManager(target: T) {
    return () => this.targets.get(target);
  }

  private retrieveDispose(target: T) {
    return () => this.dispose(target);
  }

  private dispose(target: T) {
    this.targets
      .get(target)
      .clearEvents()
      .map<BoundContext<T>>((event) => Reflect.get(target, event))
      .filter((boundContext) => Context.isAlreadyContextBound<T>(boundContext))
      .forEach((boundContext) => boundContext().resetContext());

    this.targets.delete(target);

    return target;
  }

  private shouldProcess(target: T, original: any, event: Property): boolean {
    const manager = this.targets.get(target);

    if (!isFunction(original) || isUndefined(manager)) {
      return false;
    }

    const { [PRE]: pre, [POST]: post } = manager.getEventHandlers(event);

    return Boolean(pre.length + post.length);
  }

  private setTarget(target: T): SurrogateProxy<T> {
    if (!this.targets.has(target)) {
      this.targets.set(target, new SurrogateEventManager());
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
}

/**
 * Helper function to create Surrogate wrapped objects
 *
 * @export
 * @template T
 * @param {T} object
 * @param {SurrogateOptions} [options={}]
 * @returns {Surrogate<T>}
 */
export const wrapSurrogate = <T extends object>(
  object: T,
  options: SurrogateOptions = {},
): Surrogate<T> => SurrogateProxy.wrap(object, options);
