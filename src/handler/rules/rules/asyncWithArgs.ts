import { NextHandler } from '../../../interfaces';
import { AsyncHandlerRule } from '../interfaces';
import { HandlerBaseRule } from '../base';

export class AsyncHandlerWithArgsRule<T extends object>
  extends HandlerBaseRule<T>
  implements AsyncHandlerRule<T>
{
  run(nextHandler: NextHandler<T>) {
    return this.handler.call(this.context, nextHandler) as Promise<any>;
  }

  shouldHandle(): boolean {
    return this.shouldRunWithArgs();
  }
}
