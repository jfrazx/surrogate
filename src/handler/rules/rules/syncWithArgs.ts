import { NextParameters } from '../../../interfaces';
import { HandlerBaseRule } from '../base';

export class SyncHandlerWithArgsRule<T extends object> extends HandlerBaseRule<T> {
  run(nextParameters: NextParameters<T>) {
    return this.handler.call(this.context, nextParameters);
  }

  shouldHandle(): boolean {
    return this.shouldRunWithArgs();
  }
}
