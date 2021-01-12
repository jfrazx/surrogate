import { ErrorRule, CompleteRule, NextRule } from './rules';
import { INext, NextOptions } from '../interfaces';
import { nextOptionDefaults } from './lib';
import { BaseNext } from './baseNext';

export class FinalNext<T extends object> extends BaseNext<T> implements INext<T> {
  skipWith(_times?: number, ...args: any[]): void {
    return this.next({ using: args });
  }

  next(nextOptions: NextOptions = {}): void {
    const useOptions = { ...nextOptionDefaults, ...nextOptions };
    const { error, using } = useOptions;

    const rules: NextRule<T>[] = [
      new ErrorRule(error, using, useOptions),
      new CompleteRule(using),
    ];

    const rule = rules.find((runner) => runner.shouldRun());

    rule.run(this);
  }
}
