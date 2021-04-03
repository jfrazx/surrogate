import { Surrogate, MethodWrapper, SurrogateOptions } from '../interfaces';
import { containerGenerator, Tail, HandlerContainer } from '../containers';
import { Context, BoundContext } from '../context';
import { Next, ExecutionContext } from '../next';
import { FetchRuleRunner } from './rules';
import { EventManager } from '../manager';
import { PRE, POST } from '../which';
import { isAsync } from '../helpers';

type Target<T extends object> = WeakMap<any, EventManager<T>>;
type Handle = (...args: any[]) => any;

export class SurrogateProxy<T extends object> implements ProxyHandler<T> {
  targets: Target<T> = new WeakMap();
  private static instance: SurrogateProxy<any>;

  constructor(target: T, { useSingleton = true }: SurrogateOptions) {
    const instance = this.useInstance(useSingleton);

    return instance.setTarget(target);
  }

  get<K extends keyof T>(
    target: T,
    event: string,
    receiver: Surrogate<T>,
  ): T[K] | EventManager<T> | Handle {
    return FetchRuleRunner.fetchRule(this, target, event, receiver).returnableValue();
  }

  static wrap<T extends object>(object: T, options?: SurrogateOptions): Surrogate<T> {
    return new Proxy(object, new SurrogateProxy(object, options)) as Surrogate<T>;
  }

  bindHandler(event: string, target: T, receiver: Surrogate<T>) {
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

    Next.for(
      this,
      context,
      executionContext,
      containerGenerator(pre, Tail.for(PRE, args)),
      PRE,
    );
    Next.for(this, context, executionContext, containerGenerator(post, Tail.for(POST)), POST);

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

  dispose(target: T) {
    this.targets
      .get(target)
      .clearEvents()
      .map<BoundContext<T>>((event) => Reflect.get(target, event))
      .filter((boundContext) => Context.isAlreadyContextBound<T>(boundContext))
      .forEach((boundContext) => boundContext().resetContext());

    this.targets.delete(target);

    return target;
  }

  private setTarget(target: T): SurrogateProxy<T> {
    if (!this.targets.has(target)) {
      this.targets.set(target, new EventManager());
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
