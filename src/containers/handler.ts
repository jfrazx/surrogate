import { SurrogateHandler } from '../interfaces';
import { OptionsHandler } from '../options';
import { BaseContainer } from './base';
import { Which } from '../which';

export class SurrogateHandlerContainer<T extends object> extends BaseContainer<T> {
  constructor(
    public handler: SurrogateHandler<T>,
    public type: Which,
    options: OptionsHandler<T>,
  ) {
    super(handler, type, options);
  }
}
