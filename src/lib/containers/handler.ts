import { SurrogateHandler, SurrogateMethodOptions } from '../interfaces';
import { BaseContainer } from './base';
import { Which } from '../which';

export class HandlerContainer<T extends object> extends BaseContainer<T> {
  constructor(
    public handler: SurrogateHandler<T>,
    public type: Which,
    options: SurrogateMethodOptions<T> = {},
  ) {
    super(handler, type, options);
  }
}
