import type { SurrogateHandlerTypes } from '../interfaces';
import type { OptionsHandler } from '../options';
import { BaseContainer } from './base';
import type { Which } from '../which';

export class SurrogateHandlerContainer<T extends object> extends BaseContainer<T> {
  constructor(
    public readonly handler: SurrogateHandlerTypes<T>,
    public readonly type: Which,
    options: OptionsHandler<T>,
  ) {
    super(handler, type, options);
  }
}
