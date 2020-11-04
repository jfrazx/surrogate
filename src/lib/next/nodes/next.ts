import { HandlerContainer, ContainerGenerator, IContainer } from '../../containers';
import { SurrogateProxy } from '../../surrogateProxy';
import { INext, NextOptions } from '../interfaces';
import { nextOptionDefaults } from './lib';
import { Context } from '../../context';
import { Execution } from '../context';
import { BaseNext } from './baseNext';

export class Next<T extends object> extends BaseNext<T> implements INext<T> {
  constructor(
    proxy: SurrogateProxy<T>,
    context: Context<T>,
    executionContext: Execution<T>,
    iterator: Generator<IContainer<T>, IContainer<T>, ContainerGenerator<T>>,
    public container: HandlerContainer<T>,
  ) {
    super(proxy, context, executionContext, iterator, container);

    this.nextNode = Next.for(proxy, context, executionContext, iterator);
  }

  skipWith(times = 1, ...args: any[]): void {
    if (times > 0) {
      return this.nextNode.skipWith(times - 1, ...args);
    }

    return this.next({ using: args });
  }

  next(nextOptions: NextOptions = {}): void {
    const useNextOptions = { ...nextOptionDefaults, ...nextOptions };
    const { error, using, bail } = useNextOptions;

    if (error) {
      return this.nextError(error, ...using);
    }

    if (bail) {
      this.didBail = bail;
    }

    const { handler } = this.container;
    const { target } = this.context;

    this.shouldRun() ? handler.call(target, this.nextNode, ...using) : this.skip();
  }
}
