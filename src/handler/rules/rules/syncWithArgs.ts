import { NextHandler } from '../../../interfaces';
import { HandlerBaseRule } from '../base';

export class SyncHandlerWithArgsRule<T extends object> extends HandlerBaseRule<T> {
  run(nextHandler: NextHandler<T>) {
    return this.handler.call(this.context, nextHandler);
  }

  shouldRun(): boolean {
    return this.shouldRunWithArgs();
  }
}
