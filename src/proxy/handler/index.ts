import type { Surrogate, SurrogateOptions, SurrogateGlobalOptions } from '../../interfaces';
import { FetchRuleRunner, InternalMethods } from '../rules';
import { ExecutionContext } from '../../next';
import { EventManager } from '../../manager';
import { isFunction } from '../../helpers';
import { Context } from '../../context';

type Target<T extends object> = WeakMap<T, EventManager<T>>;

export class SurrogateProxy<T extends object> implements ProxyHandler<T> {
  private readonly targets: Target<T> = new WeakMap();
  private static instance: SurrogateProxy<any>;

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

  static wrap<T extends object>(object: T, options?: SurrogateOptions): Surrogate<T> {
    return this.hasTarget(object)
      ? (object as Surrogate<T>)
      : (new Proxy(object, new SurrogateProxy(object, options)) as Surrogate<T>);
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
