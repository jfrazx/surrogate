import { NextParameters } from '../../../interfaces';
import { AsyncHandlerRule } from '../interfaces';
import { HandlerBaseRule } from '../base';

export class AsyncHandlerWithArgsRule<T extends object>
  extends HandlerBaseRule<T>
  implements AsyncHandlerRule<T>
{
  run(nextParameters: NextParameters<T>) {
    return this.handler.call(this.context, nextParameters) as Promise<any>;
  }

  shouldHandle(): boolean {
    return this.shouldRunWithArgs();
  }
}
