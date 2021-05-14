import { containerGenerator, Tail, HandlerContainer } from '../containers';
import { Next, ExecutionContext } from '../next';
import { isAsync, isFunction } from '../helpers';
import { FetchRuleRunner } from './rules';
import { EventManager } from '../manager';
import { PRE, POST } from '../which';
import { Context } from '../context';
import {
  Surrogate,
  MethodWrapper,
  SurrogateOptions,
  SurrogateGlobalOptions,
} from '../interfaces';

type Target<T extends object> = WeakMap<any, EventManager<T>>;

export class SurrogateProxy<T extends object> implements ProxyHandler<T> {
  private readonly targets: Target<T> = new WeakMap();
  private static instance: SurrogateProxy<any>;

  constructor(target: T, { useSingleton = true, ...globalOptions }: SurrogateOptions) {
    const instance = this.useInstance(useSingleton);

    return instance.setTarget(target, globalOptions);
  }

  get<K extends keyof T>(
    target: T,
    event: string,
    receiver: Surrogate<T>,
  ): T[K] | EventManager<T> {
    return FetchRuleRunner.fetchRule(this, target, event, receiver).returnableValue();
  }

  getEventManager(target: T) {
    return this.targets.get(target);
  }

  static wrap<T extends object>(object: T, options?: SurrogateOptions): Surrogate<T> {
    return this.hasTarget(object)
      ? (object as Surrogate<T>)
      : (new Proxy(object, new SurrogateProxy(object, options)) as Surrogate<T>);
  }

  static hasTarget<T extends object>(target: T): target is Surrogate<T> {
    return ['getSurrogate', 'disposeSurrogate'].every((key) =>
      isFunction(target[key as keyof T]),
    );
  }

  bindHandler(event: string, target: T, receiver: Surrogate<T>) {
    const func = Reflect.get(target, event);
    const context = new Context(target, receiver, event, func);

    return this.surrogateHandler.bind(this, context);
  }

  private surrogateHandler(context: Context<T>, ...args: any[]): any {
    const { target, event, original } = context;
    const { [PRE]: pre, [POST]: post } = this.getEventManager(target).getEventHandlers(event);
    const { hasAsync } = this.initializeContextOptions([...pre, ...post]);

    const executionContext = ExecutionContext.for<T>(original, args, hasAsync);

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
      ({ handler, options }) => isAsync(handler) || options.wrapper === MethodWrapper.Async,
    );

    return {
      hasAsync,
    };
  }

  dispose(target: T) {
    this.getEventManager(target).clearEvents();
    this.targets.delete(target);

    return target;
  }

  private setTarget(target: T, globalOptions: SurrogateGlobalOptions): SurrogateProxy<T> {
    if (!this.targets.has(target)) {
      this.targets.set(target, new EventManager(globalOptions));
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
