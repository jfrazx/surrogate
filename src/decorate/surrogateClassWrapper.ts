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
    return target;
  }

  construct(Klass: T, args: any[], Target: any) {
    const { locateWith = Klass } = this.options;
    const decoratorMap = SurrogateClassWrapper.retrieveTargetDecoratorMap(locateWith);
    const wrappedInstance = SurrogateProxy.wrap<T>(
      Reflect.construct(Klass, args, Target),
      this.options,
    );

    const eventManager = wrappedInstance.getSurrogate();
    const identifier = new MethodIdentifier(wrappedInstance);

    this.applyDecorators(eventManager, decoratorMap, identifier);

    return wrappedInstance;
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
