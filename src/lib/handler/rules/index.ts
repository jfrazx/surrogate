import { PassSurrogateRule } from './passSurrogate.rule';
import { PassInstanceRule } from './passInstance.rule';
import { PassErrorRule } from './passError.rule';
import { UseNextRule } from './useNext.rule';
import { NextNode } from '../../next';
import { Rule } from './interfaces';

export abstract class ArgumentRuleRunner {
  static generateArgumentsFromRules(
    node: NextNode<any>,
    currentArguments: any[],
    error?: Error,
  ) {
    const rules: Rule[] = [
      new PassErrorRule(error),
      new UseNextRule(),
      new PassInstanceRule(),
      new PassSurrogateRule(),
    ];

    const generatedArgs = rules.reduce((args, rule) => rule.includeArg(node, args), []);

    return [...generatedArgs, ...currentArguments];
  }
}
