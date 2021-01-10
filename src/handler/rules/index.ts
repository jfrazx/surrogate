import { PassSurrogateRule } from './passSurrogate.rule';
import { PassInstanceRule } from './passInstance.rule';
import { PassErrorRule } from './passError.rule';
import { UseNextRule } from './useNext.rule';
import { ArgumentRule } from './interfaces';
import { NextNode } from '../../next';

export abstract class ArgumentRuleRunner {
  static generateArgumentsFromRules<T extends object>(
    node: NextNode<T>,
    currentArguments: any[],
    error?: Error,
  ) {
    const rules: ArgumentRule<T>[] = [
      new PassSurrogateRule<T>(),
      new PassInstanceRule<T>(),
      new UseNextRule<T>(),
      new PassErrorRule<T>(error),
    ];

    return rules.reduce((args, rule) => rule.includeArg(node, args), currentArguments);
  }
}
