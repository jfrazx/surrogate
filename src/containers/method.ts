import { OptionsHandler } from '../options';
import { BaseContainer } from './base';
import { METHOD } from '../which';

export class MethodContainer<T extends object> extends BaseContainer<T> {
  constructor(
    public handler: Function,
    public originalArgs: any[],
    options: OptionsHandler<T>,
  ) {
    super(handler, METHOD, options);
  }
}
