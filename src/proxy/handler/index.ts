import type { Surrogate, SurrogateOptions, SurrogateGlobalOptions } from '../../interfaces';
import { FetchRuleRunner, InternalMethods } from '../rules';
import { ExecutionContext } from '../../next';
import { EventManager } from '../../manager';
import { isFunction } from '../../helpers';
import { Context } from '../../context';

type Target<T extends object> = WeakMap<T, EventManager<T>>;

export class SurrogateProxy<T extends object> implements ProxyHandler<T> {
  private readonly targets: Target<T> = new WeakMap();
  private static readonly reportedConstructors = new WeakMap<object, Function>();
  private static instance: SurrogateProxy<any>;
  // Set only on the per-proxy handler that wrap() derives from the shared one.
  private surrogate?: Surrogate<T>;

  constructor(target: T, { useSingleton = true, ...globalOptions }: SurrogateOptions = {}) {
    return this.useInstance(useSingleton).setTarget(target, globalOptions);
  }

  get<K extends keyof T>(
    target: T,
    event: string,
    receiver: Surrogate<T>,
  ): T[K] | EventManager<T> {
    return FetchRuleRunner.fetchRule(this, target, event, receiver).returnableValue();
  }

  getEventManager(target: T): EventManager<T> {
    return this.targets.get(target) as EventManager<T>;
  }

  // Resolved from the proxy whose trap is running, not the receiver: a read
  // through an outer proxy or a derived object has that object as receiver.
  getReportedConstructor(): Function | undefined {
    return this.surrogate && SurrogateProxy.reportedConstructors.get(this.surrogate);
  }

  // Static, because SurrogateDelegate cannot tell which handler (the singleton
  // or one of its own) wraps the target. Keyed by the instance proxy, not its
  // target: a constructor that returns a cached raw object hands the same
  // target to every wrapper that builds it. One that returns a cached proxy
  // hands every wrapper the same proxy, so the last wrapper built is reported.
  static reportConstructor(instance: object, constructor: Function): void {
    this.reportedConstructors.set(instance, constructor);
  }

  static wrap<T extends object>(object: T, options?: SurrogateOptions): Surrogate<T> {
    if (this.hasTarget(object)) {
      return object as Surrogate<T>;
    }

    // Each proxy gets its own handler inheriting the shared one, so its traps
    // know which proxy they run for even when several proxies share a target.
    const handler: SurrogateProxy<T> = Object.create(new SurrogateProxy(object, options));
    const surrogate = new Proxy(object, handler) as Surrogate<T>;

    handler.surrogate = surrogate;

    return surrogate;
  }

  static hasTarget<T extends object>(target: T): target is Surrogate<T> {
    const methods = [InternalMethods.Dispose, InternalMethods.EventManager] as (keyof T)[];

    return methods.every((key: keyof T) => isFunction(target[key]));
  }

  bindHandler(event: string, target: T, receiver: Surrogate<T>): Function {
    const func = Reflect.get(target, event, receiver) as Function;

    return {
      [event]: (...args: any[]) =>
        this.surrogateHandler(new Context(target, receiver, event, func, args)),
    }[event];
  }

  surrogateHandler(context: Context<T>): any {
    const { target, event } = context;
    const typeContainers = this.getEventManager(target).getEventHandlers(event);

    return ExecutionContext.for<T>(context, typeContainers)
      .setupPipeline(this, typeContainers)
      .start();
  }

  dispose(target: T) {
    this.getEventManager(target).deregisterHooks();
    this.targets.delete(target);

    return target;
  }

  private setTarget(target: T, globalOptions: SurrogateGlobalOptions): SurrogateProxy<T> {
    if (!this.targets.has(target)) {
      this.targets.set(target, new EventManager<T>(globalOptions));
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
