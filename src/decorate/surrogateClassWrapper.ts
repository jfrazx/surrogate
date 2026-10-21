import type { SurrogateOptions, SurrogateEventManager } from '../interfaces';
import { SurrogateProxy } from '../proxy/handler';
import { wrapDefaults } from '@status/defaults';
import { MethodIdentifier } from '../identifier';
import { Which, HookType } from '../which';
import {
  Constructor,
  SurrogateDecorateOptions,
  SurrogateDecoratorOptions,
} from './interfaces';

interface DecoratedEventMap {
  [key: string]: DecoratorContainer;
}

interface DecoratorContainer {
  [HookType.PRE]: SurrogateDecoratorOptions<any>[];
  [HookType.POST]: SurrogateDecoratorOptions<any>[];
}

export class SurrogateClassWrapper<T extends Function> implements ProxyHandler<T> {
  static readonly decoratorMap = new Map<Function, DecoratedEventMap>();

  constructor(private readonly options: SurrogateDecorateOptions<T>) {}

  getPrototypeOf(target: T): object | null {
    // Inserting the target into its own proxy's prototype chain lets
    // reflect-metadata (and similar libraries) find class-level metadata
    // that other decorators stored on the original class. The Proxy
    // invariant requires this to match Reflect.getPrototypeOf(target) when
    // the target is non-extensible, so fall back in that case — metadata
    // interop is lost, but the lookup will not throw.
    return Object.isExtensible(target) ? target : Reflect.getPrototypeOf(target);
  }

  construct(Klass: T, args: any[], Target: any) {
    // Decorator-only options stay out of the instance's global options, which
    // every hook handler receives.
    const { locateWith = Klass, reportWrapperAsConstructor, ...options } = this.options;
    const decoratorMap = SurrogateClassWrapper.retrieveTargetDecoratorMap(locateWith);
    const wrappedInstance = SurrogateProxy.wrap<T>(
      Reflect.construct(Klass, args, Target),
      options,
    );

    if (reportWrapperAsConstructor) {
      this.reportWrapper(wrappedInstance.bypassSurrogate(), Klass, Target);
    }

    const eventManager = wrappedInstance.getSurrogate();
    const identifier = new MethodIdentifier(wrappedInstance);

    this.applyDecorators(eventManager, decoratorMap, identifier);

    return wrappedInstance;
  }

  // Reported per instance, so the class and its prototype are left alone. Only
  // an instance built directly from Klass (or from the class Klass wraps)
  // reports new.target; an instance of a subclass keeps its own constructor.
  private reportWrapper(instance: object, Klass: T, Target: Function): void {
    if (Reflect.getPrototypeOf(instance) === Klass.prototype) {
      SurrogateProxy.reportConstructor(instance, Target);
    }
  }

  private applyDecorators(
    eventManager: SurrogateEventManager<T>,
    decoratorMap: DecoratedEventMap,
    identifier: MethodIdentifier<T>,
  ) {
    const methods = identifier.instanceMethodNames();

    Object.entries(decoratorMap).forEach(([action, options]) => {
      const events = identifier.getApplicableMethods(action, methods);

      Object.entries(options).forEach(([which, handlerOptions]) => {
        events.forEach((event) => {
          this.registerHandlers(eventManager, handlerOptions, which as Which, event);
        });
      });
    });
  }

  private registerHandlers(
    eventManager: SurrogateEventManager<T>,
    handlerOptions: SurrogateDecoratorOptions<T>[],
    hook: Which,
    event: string | keyof T,
  ): void {
    handlerOptions.forEach(({ handler, options }) => {
      eventManager.registerHook(event, hook, handler, options!);
    });
  }

  static wrap<T extends Function>(klass: T, options: SurrogateOptions): T {
    return new Proxy(klass, new SurrogateClassWrapper(options));
  }

  static addDecorators<T extends object>(
    klass: Constructor<T>,
    type: Which,
    event: string,
    surrogateDecoratorOptions: SurrogateDecoratorOptions<any>[],
  ) {
    const decoratorMap = this.retrieveTargetDecoratorMap(klass);

    decoratorMap[event][type].push(...surrogateDecoratorOptions);

    return this.decoratorMap.set(klass, decoratorMap);
  }

  private static retrieveTargetDecoratorMap<T extends Function>(klass: T): DecoratedEventMap {
    return (
      this.decoratorMap.get(klass) ??
      wrapDefaults({
        defaultValue: {
          [HookType.PRE]: [],
          [HookType.POST]: [],
        },
        setUndefined: true,
        shallowCopy: false,
      })
    );
  }
}
