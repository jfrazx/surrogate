import { NextOptions, INext, ContainerGenerator } from '../interfaces';
import { SurrogateProxy, Container, Context } from '../lib';
import { BaseNext } from './base-next';

const nextOptionDefaults: NextOptions = { error: null, using: [], bail: false };

export class Next<T extends object> extends BaseNext<T> implements INext<T> {
  constructor(
    proxy: SurrogateProxy<T>,
    context: Context<T>,
    iterator: Generator<Container, Container, ContainerGenerator>,
    container: Container,
  ) {
    super(proxy, context, iterator, container);

    this._next = Next.for(proxy, context, iterator);
  }

  skipWith(times = 1, ...args: any[]): void {
    if (times > 0) {
      return this._next.skipWith(times - 1, ...args);
    }

    return this.next({ using: args });
  }

  next(options: NextOptions = {}) {
    const useOptions = { ...nextOptionDefaults, ...options };
    const { error, using, bail } = useOptions;

    if (error) {
      return this.nextError(error, ...using);
    }

    if (bail) {
      // stop processing
    }

    const { callback } = this.container;
    const { target } = this.context;

    callback.call(target, this._next, ...using);
  }
}
