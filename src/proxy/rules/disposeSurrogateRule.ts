import { FetchRule, InternalMethods } from './interfaces';
import { Property } from '../../interfaces';
import { SurrogateProxy } from '../proxy';

export class DisposeSurrogateRule<T extends object> implements FetchRule {
  constructor(
    private readonly proxy: SurrogateProxy<T>,
    private readonly target: T,
    private readonly event: Property,
  ) {}

  shouldHandle(): boolean {
    return this.event.toString() === InternalMethods.Dispose;
  }

  returnableValue() {
    return () => this.proxy.dispose(this.target);
  }
}
