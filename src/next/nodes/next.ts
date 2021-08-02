import { NextRule, SkipRule, HandlerRule } from './rules';
import { SurrogateHandlerContainer } from '../../containers';
import { INext, NextOptions } from '../interfaces';
import { ContextController } from '../context';
import { SurrogateProxy } from '../../proxy';
import { nextOptionDefaults } from './lib';
import { Context } from '../../context';
import { BaseNext } from './baseNext';
import { Which } from '../../which';

export class Next<T extends object> extends BaseNext<T> implements INext {
  constructor(
    proxy: SurrogateProxy<T>,
    context: Context<T>,
    executionContext: ContextController<T>,
    public container: SurrogateHandlerContainer<T>,
    hookType: Which,
  ) {
    super(proxy, context, executionContext, container, hookType);
  }

  skipWith(times: number, ...args: any[]): void {
    if (times > 0) {
      this.controller.setNext(this.nextNode);

      return this.nextNode.skipWith(times - 1, ...args);
    }

    return this.handleNext({ using: args });
  }

  handleNext(nextOptions: NextOptions = {}): void {
    const useNextOptions = { ...nextOptionDefaults, ...nextOptions };
    const { using } = useNextOptions;

    const rules: NextRule<T>[] = [new HandlerRule(this, using), new SkipRule()];

    const rule = rules.find((runner) => runner.shouldRun());

    rule.run(this);
  }
}
