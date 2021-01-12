import { ErrorRule, NextRule, BailRule, SkipRule, HandlerRule } from './rules';
import { HandlerContainer, ContainerGenerator } from '../../containers';
import { INext, NextOptions } from '../interfaces';
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
    const { error, using } = useNextOptions;

    const rules: NextRule<T>[] = [
      new ErrorRule(error, using, useNextOptions),
      new BailRule(useNextOptions),
      new HandlerRule(this, using),
      new SkipRule(),
    ];

    const rule = rules.find((runner) => runner.shouldRun());

    rule.run(this);
  }
}
