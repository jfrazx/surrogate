import { NextOptions, INext, ContainerGenerator } from '../interfaces';
import { SurrogateProxy } from '../surrogate';
import { Container } from '../container';
import { BaseNext } from './base-next';
import { Context } from '../context';

export class Next<T extends object> extends BaseNext<T> implements INext {
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

  next({ error, using }: NextOptions = { error: null, using: [] }) {
    if (error) {
      this.iterator.throw(error);
    }

    const { callback } = this.container;
    const { target } = this.context;

    callback.call(target, this._next, ...using);
  }
}
