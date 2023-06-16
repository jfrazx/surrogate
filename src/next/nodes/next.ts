import { NextRule, SkipRule, HandlerRule } from './rules';
import type { INext, NextOptions } from '../interfaces';
import { nextOptionDefaults } from './lib';
import { BaseNext } from './baseNext';

export class Next<T extends object> extends BaseNext<T> implements INext {
  skipWith(times: number = 1, ...args: any[]): void {
    if (times > 0) {
      this.controller.setNext(this.nextNode);

      return this.nextNode.skipWith(times - 1, ...args);
    }

    return this.nextNode.handleNext({ using: args });
  }

  handleNext(nextOptions: NextOptions = {}): void {
    const useNextOptions = { ...nextOptionDefaults, ...nextOptions };
    const { using } = useNextOptions;

    const rules: NextRule<T>[] = [new HandlerRule(this, using!), new SkipRule()];

    const rule: NextRule<T> = rules.find((runner: NextRule<T>) => runner.shouldRun())!;

    rule.run(this);
  }
}
