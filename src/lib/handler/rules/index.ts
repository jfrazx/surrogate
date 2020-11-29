import { PassSurrogateRule } from './passSurrogate.rule';
import { PassInstanceRule } from './passInstance.rule';
import { PassErrorRule } from './passError.rule';
import { UseNextRule } from './useNext.rule';
import { NextNode } from '../../next';
import { Rule } from './interfaces';

export abstract class ArgumentRuleRunner {
  static generateArgumentsFromRules<T extends object>(
    node: NextNode<T>,
    currentArguments: any[],
    error?: Error,
  ) {
    const rules: Rule<T>[] = [
      new PassErrorRule<T>(error),
      new UseNextRule<T>(),
      new PassInstanceRule<T>(),
      new PassSurrogateRule<T>(),
    ];

    const generatedArgs = rules.reduce((args, rule) => rule.includeArg(node, args), []);

    return [...generatedArgs, ...currentArguments];
  }
}
