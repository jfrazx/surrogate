import type { SurrogateHandlerTypes } from '../interfaces';
import type { OptionsHandler } from '../options';
import { BaseContainer } from './base';
import type { Which } from '../which';

export class SurrogateHandlerContainer<T extends object> extends BaseContainer<T> {
  constructor(
    public handler: SurrogateHandlerTypes<T>,
    public type: Which,
    options: OptionsHandler<T>,
  ) {
    super(handler, type, options);
  }
}
