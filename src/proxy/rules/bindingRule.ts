import { Surrogate } from '../../interfaces';
import { SurrogateProxy } from '../handler';
import { FetchRule } from './interfaces';

export class BindingRule<T extends object> implements FetchRule {
  constructor(
    private readonly proxy: SurrogateProxy<T>,
    private readonly target: T,
    private readonly event: string,
    private readonly receiver: Surrogate<T>,
  ) {}

  shouldHandle(): boolean {
    return true;
  }

  returnableValue() {
    const { target, event, receiver } = this;

    return this.proxy.bindHandler(event, target, receiver);
  }
}
