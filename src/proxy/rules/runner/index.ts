import { DisposeSurrogateRule } from '../disposeSurrogateRule';
import { FetchRuleConstruct, FetchRule } from '../interfaces';
import { BypassSurrogateRule } from '../bypassSurrogateRule';
import { UnprocessableRule } from '../unprocessableRule';
import { ConstructorRule } from '../constructorRule';
import { EventMangerRule } from '../eventMangerRule';
import { Surrogate } from '../../../interfaces';
import { SurrogateProxy } from '../../handler';
import { BindingRule } from '../bindingRule';

export abstract class FetchRuleRunner {
  static fetchRule<T extends object>(
    proxy: SurrogateProxy<T>,
    target: T,
    event: string,
    receiver: Surrogate<T>,
  ): FetchRule {
    const rules: FetchRuleConstruct<T>[] = [
      DisposeSurrogateRule,
      BypassSurrogateRule,
      EventMangerRule,
      ConstructorRule,
      UnprocessableRule,
    ];

    // Rules run on every property read, so build each only until one applies.
    for (const Rule of rules) {
      const rule = new Rule(proxy, target, event, receiver);

      if (rule.shouldHandle()) {
        return rule;
      }
    }

    return new BindingRule(proxy, target, event, receiver);
  }
}
