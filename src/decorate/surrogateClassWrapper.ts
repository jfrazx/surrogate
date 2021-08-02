import { SurrogateOptions, SurrogateEventManager } from '../interfaces';
import { wrapDefaults } from '@status/defaults';
import { Which, POST, PRE } from '../which';
import { SurrogateProxy } from '../proxy';
import { isFunction } from '../helpers';
import {
  Constructor,
  SurrogateDecorateOptions,
  SurrogateDecoratorOptions,
} from './interfaces';

interface DecoratedEventMap {
  [key: string]: DecoratorContainer;
}

interface DecoratorContainer {
  [PRE]: SurrogateDecoratorOptions<any>[];
  [POST]: SurrogateDecoratorOptions<any>[];
}

export class SurrogateClassWrapper<T extends Function> implements ProxyHandler<T> {
  static decoratorMap = new Map<Function, DecoratedEventMap>();

  constructor(private options: SurrogateDecorateOptions<T>) {}

  construct(Klass: T, args: any[], Target: any) {
    const { locateWith = Klass } = this.options;
    const decoratorMap = SurrogateClassWrapper.retrieveTargetDecoratorMap(locateWith);
    const wrappedInstance = SurrogateProxy.wrap<T>(
      Reflect.construct(Klass, args, Target),
      this.options,
    );

    const methods = this.getPropertyNames(wrappedInstance);
    const eventManager = wrappedInstance.getSurrogate();

    this.applyDecorators(eventManager, decoratorMap, methods);

    return wrappedInstance;
  }

  private getPropertyNames(instance: T): string[] {
    const objectProto = Object.getPrototypeOf({});
    const props: string[][] = [];
    let current = instance;

    do {
      props.push(Object.getOwnPropertyNames(current));
    } while (
      Object.getPrototypeOf(current) !== objectProto &&
      (current = Object.getPrototypeOf(current))
    );

    const properties = new Set(props.flatMap((p) => p));

    return [...properties.values()]
      .filter((prop) => prop !== 'constructor')
      .filter((name) => isFunction(Reflect.get(instance, name)));
  }

  private applyDecorators(
    eventManager: SurrogateEventManager<T>,
    decoratorMap: DecoratedEventMap,
    methods: string[],
  ) {
    Object.entries(decoratorMap).forEach(([action, options]) => {
      const events = this.getApplicableMethods(action, methods);

      events.forEach((event) => {
        Object.getOwnPropertySymbols(options).forEach((which: any) => {
          const {
            [which]: handlerOptions,
          }: { [hook: string]: SurrogateDecoratorOptions<T>[] } = options as any;

          this.registerHandlers(eventManager, handlerOptions, which, event);
        });
      });
    });
  }

  private getApplicableMethods(event: string, methods: string[]): string[] {
    const methodTest = new RegExp(event);

    return methods.includes(event)
      ? [event]
      : methods.filter((method) => methodTest.test(method));
  }

  private registerHandlers(
    eventManager: SurrogateEventManager<T>,
    handlerOptions: SurrogateDecoratorOptions<T>[],
    hook: Which,
    event: string | keyof T,
  ) {
    handlerOptions.forEach(({ handler, options }) => {
      eventManager.registerHook(event, hook, handler, options);
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

  private static retrieveTargetDecoratorMap<T extends Function>(klass: T) {
    return (
      this.decoratorMap.get(klass) ??
      wrapDefaults({
        defaultValue: {
          [PRE]: [],
          [POST]: [],
        },
        setUndefined: true,
        shallowCopy: false,
      })
    );
  }
}
