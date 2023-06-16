import { DisposeSurrogateRule } from '../disposeSurrogateRule';
import { FetchRuleConstruct, FetchRule } from '../interfaces';
import { BypassSurrogateRule } from '../bypassSurrogateRule';
import { UnprocessableRule } from '../unprocessableRule';
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
      UnprocessableRule,
      BindingRule,
    ];

    return rules
      .map((Rule: FetchRuleConstruct<T>) => new Rule(proxy, target, event, receiver))
      .find((rule: FetchRule) => rule.shouldHandle())!;
  }
}
