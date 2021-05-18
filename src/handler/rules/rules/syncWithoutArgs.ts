import { HandlerBaseRule } from '../base';

export class SyncHandlerWithoutArgsRule<T extends object> extends HandlerBaseRule<T> {
  run() {
    return this.handler.call(this.context);
  }

  shouldRun(): boolean {
    return this.shouldRunWithoutArgs();
  }
}
