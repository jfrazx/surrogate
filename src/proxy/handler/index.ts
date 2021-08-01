import { Surrogate, SurrogateOptions, SurrogateGlobalOptions } from '../../interfaces';
import { ExecutionContext } from '../../next';
import { EventManager } from '../../manager';
import { FetchRuleRunner } from '../rules';
import { isFunction } from '../../helpers';
import { Context } from '../../context';

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
    const typeContainers = this.getEventManager(target).getEventHandlers(event);

    return ExecutionContext.for<T>(original, args, typeContainers)
      .setupPipeline(this, context, typeContainers)
      .start();
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
