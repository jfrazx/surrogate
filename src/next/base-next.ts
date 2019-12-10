import { INext, NextOptions, ContainerGenerator } from '../interfaces';
import { SurrogateProxy } from '../surrogate';
import { Container } from '../container';
import { Context } from '../context';

export abstract class BaseNext<T extends object> implements INext {
  _next: INext = null;

  constructor(
    protected proxy: SurrogateProxy<T>,
    public context: Context<T>,
    protected iterator: Generator<Container, Container, ContainerGenerator>,
    protected container: Container,
  ) {}

  static for(
    proxy: SurrogateProxy<any>,
    context: Context<any>,
    iterator: Generator<Container, Container, ContainerGenerator>,
  ): INext {
    const { value, done } = iterator.next();

    return done
      ? new FinalNext(proxy, context, iterator, value)
      : new Next(proxy, context, iterator, value);
  }

  skip(times: number = 1): void {
    return this.skipWith(times);
  }

  nextError(error: Error, ...args: any[]) {
    const {
      options: { ignoreErrors = false, passErrors = false, passInstance = false },
    } = this.container;

    if (passErrors) {
      if (passInstance) {
        const { target } = this.context;

        args.unshift(target);
      }
      args.unshift(error);
    }

    if (ignoreErrors) {
      return this.next({ error: null, using: args });
    }

    this.iterator.throw(error);
  }

  abstract skipWith(times?: number, ...args: any[]): void;
  abstract next(options?: NextOptions): void;
}

import { Next } from './next';
import { FinalNext } from './final-next';
