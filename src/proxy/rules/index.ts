import { DisposeSurrogateRule } from './disposeSurrogateRule';
import { FetchRuleConstruct, FetchRule } from './interfaces';
import { UnprocessableRule } from './unprocessableRule';
import { Surrogate, Property } from '../../interfaces';
import { EventMangerRule } from './eventMangerRule';
import { BindingRule } from './bindingRule';
import { SurrogateProxy } from '../proxy';

export abstract class FetchRuleRunner {
  static fetchRule<T extends object>(
    proxy: SurrogateProxy<T>,
    target: T,
    event: Property,
    receiver: Surrogate<T>,
  ): FetchRule {
    const rules: FetchRuleConstruct<T>[] = [
      DisposeSurrogateRule,
      EventMangerRule,
      UnprocessableRule,
      BindingRule,
    ];

    return rules
      .map((Rule) => new Rule(proxy, target, event, receiver))
      .find((rule) => rule.shouldHandle());
  }
}
