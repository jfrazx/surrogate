import { AsyncHandlerRule } from '../interfaces';
import { HandlerBaseRule } from '../base';

export class AsyncHandlerWithoutArgsRule<T extends object>
  extends HandlerBaseRule<T>
  implements AsyncHandlerRule<T> {
  run() {
    return this.handler.call(this.context) as Promise<any>;
  }

  shouldRun(): boolean {
    return this.shouldRunWithoutArgs();
  }
}
