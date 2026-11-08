import { BaseContainer } from './base';
import { METHOD } from '../which';

export class MethodContainer<T extends object> extends BaseContainer<T> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type -- handlers and wrapped methods are arbitrary user functions
  constructor(public readonly handler: Function) {
    super(handler, METHOD);
  }
}
