import { SurrogateOptions, SurrogateEventManager } from '../interfaces';
import { wrapDefaults } from '@status/defaults';
import { Which, POST, PRE } from '../which';
import { SurrogateProxy } from '../proxy';
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

    const eventManager = wrappedInstance.getSurrogate();

    this.applyDecorators(eventManager, decoratorMap);

    return wrappedInstance;
  }

  private applyDecorators(
    eventManager: SurrogateEventManager<T>,
    decoratorMap: DecoratedEventMap,
  ) {
    Object.entries(decoratorMap).forEach(([event, options]) => {
      Object.getOwnPropertySymbols(options).forEach((which: any) => {
        const { [which]: handlerOptions }: { [hook: string]: SurrogateDecoratorOptions<T>[] } =
          options as any;

        handlerOptions.forEach(({ handler, options }) => {
          eventManager.registerHook(event as keyof T, which, handler, options);
        });
      });
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
