import type { NextParameters } from '../../../interfaces';
import { HandlerBaseRule } from '../base';

export class WithArgsRule<T extends object> extends HandlerBaseRule<T> {
  run(nextParameters: NextParameters<T>) {
    return this.handler.call(this.context, nextParameters);
  }

  shouldHandle(): boolean {
    return this.shouldRunWithArgs();
  }
}
