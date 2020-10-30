import { Container, ContainerGenerator } from '../container';
import { SurrogateProxy } from '../surrogateProxy';
import { BaseNext } from './baseNext';
import { Context } from '../context';
import { INext } from './interfaces';
import { Which } from '../which';

export class Next<T extends object> extends BaseNext<T> implements INext<T> {
  constructor(
    proxy: SurrogateProxy<T>,
    context: Context<T>,
    type: Which,
    iterator: Generator<Container, Container, ContainerGenerator>,
    container: Container,
  ) {
    super(proxy, context, type, iterator, container);

    this._next = Next.for(proxy, context, type, iterator);
  }

  skipWith(times = 1, ...args: any[]): void {
    if (times > 0) {
      return this._next.skipWith(times - 1, ...args);
    }

    return this.next({ using: args });
  }
}
