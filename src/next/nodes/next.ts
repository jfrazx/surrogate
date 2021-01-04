import { HandlerContainer, ContainerGenerator } from '../../containers';
import { INext, NextOptions } from '../interfaces';
import { HandlerRunner } from '../../handler';
import { SurrogateProxy } from '../../proxy';
import { nextOptionDefaults } from './lib';
import { Context } from '../../context';
import { Execution } from '../context';
import { BaseNext } from './baseNext';

export class Next<T extends object> extends BaseNext<T> implements INext<T> {
  constructor(
    proxy: SurrogateProxy<T>,
    context: Context<T>,
    executionContext: Execution<T>,
    iterator: ContainerGenerator<T>,
    public container: HandlerContainer<T>,
  ) {
    super(proxy, context, executionContext, iterator, container);

    this.nextNode = Next.for(proxy, context, executionContext, iterator);
  }

  skipWith(times = 1, ...args: any[]): void {
    if (times > 0) {
      this.controller.setNext(this.nextNode);

      return this.nextNode.skipWith(times - 1, ...args);
    }

    return this.next({ using: args });
  }

  next(nextOptions: NextOptions = {}): void {
    const useNextOptions = { ...nextOptionDefaults, ...nextOptions };
    const { error, using, bail } = useNextOptions;

    if (error) {
      return this.nextError(error, using, useNextOptions);
    }

    if (bail) {
      return this.controller.bail(useNextOptions.bailWith);
    }

    const handler = HandlerRunner.for(this);

    this.shouldRun() ? handler.run(using, this.didError) : this.skip();
  }
}
