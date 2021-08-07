import { BaseContainer } from './base';
import { METHOD } from '../which';

export class MethodContainer<T extends object> extends BaseContainer<T> {
  constructor(public handler: Function) {
    super(handler, METHOD);
  }
}
