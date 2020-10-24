import { SurrogateEventManager } from '../surrogate-event-manager';
import { SurrogateDecoratorOptions } from './interfaces';
import { Which, POST_HOOK, PRE_HOOK } from '../which';
import { SurrogateProxy } from '../surrogate-proxy';
import { SurrogateOptions } from '../interfaces';
import { wrapDefaults } from '@status/defaults';

type Constructor<T> = { new (...args: any[]): T };

interface DecoratedEventMap {
  [key: string]: DecoratorContainer;
}

interface DecoratorContainer {
  [PRE_HOOK]: SurrogateDecoratorOptions<any>[];
  [POST_HOOK]: SurrogateDecoratorOptions<any>[];
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
          eventManager.registerHook(event, which, handler, options);
        });
      });
    });
  }

  static wrap<T extends object>(klass: T, options: SurrogateOptions = {}): T {
    return new Proxy(klass, new SurrogateClassWrapper(options));
  }

  static addDecorators(
    klass: object,
    type: Which,
    event: string,
    SurrogateDecoratorOptions: SurrogateDecoratorOptions<any>[],
  ) {
    const decoratorMap = this.retrieveTargetDecoratorMap(klass);

    decoratorMap[event][type].push(...SurrogateDecoratorOptions);

    return this.decoratorMap.set(klass, decoratorMap);
  }

  private static retrieveTargetDecoratorMap(klass: object) {
    return (
      this.decoratorMap.get(klass) ??
      wrapDefaults({
        defaultValue: {
          [PRE_HOOK]: [],
          [POST_HOOK]: [],
        },
        setUndefined: true,
        shallowCopy: false,
      })
    );
  }
}
