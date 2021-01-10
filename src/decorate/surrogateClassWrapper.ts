import { SurrogateOptions, SurrogateEventManager } from '../interfaces';
import { SurrogateDecoratorOptions } from './interfaces';
import { wrapDefaults } from '@status/defaults';
import { Which, POST, PRE } from '../which';
import { SurrogateProxy } from '../proxy';

type Constructor<T> = { new (...args: any[]): T };

interface DecoratedEventMap {
  [key: string]: DecoratorContainer;
}

interface DecoratorContainer {
  [PRE]: SurrogateDecoratorOptions<any>[];
  [POST]: SurrogateDecoratorOptions<any>[];
}

export class SurrogateClassWrapper<T extends object> implements ProxyHandler<T> {
  private static decoratorMap = new Map<object, DecoratedEventMap>();

  constructor(private options: SurrogateOptions = {}) {}

  construct(Target: T, args: any[]) {
    const decoratorMap = SurrogateClassWrapper.retrieveTargetDecoratorMap(Target);
    const wrappedInstance = SurrogateProxy.wrap(
      new (Target as Constructor<T>)(...args),
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
        const {
          [which]: handlerOptions,
        }: { [hook: string]: SurrogateDecoratorOptions<T>[] } = options as any;

        handlerOptions.forEach(({ handler, options }) => {
          eventManager.registerHook(event as keyof T, which, handler, options);
        });
      });
    });
  }

  static wrap<T extends object>(klass: T, options: SurrogateOptions = {}): T {
    return new Proxy(klass, new SurrogateClassWrapper(options));
  }

  static addDecorators<T extends object>(
    klass: object,
    type: Which,
    event: keyof T,
    surrogateDecoratorOptions: SurrogateDecoratorOptions<any>[],
  ) {
    const decoratorMap = this.retrieveTargetDecoratorMap(klass);

    decoratorMap[event as string][type].push(...surrogateDecoratorOptions);

    return this.decoratorMap.set(klass, decoratorMap);
  }

  private static retrieveTargetDecoratorMap(klass: object) {
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
