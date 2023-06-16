import { HandlerBaseRule } from '../base';

export class WithoutArgsRule<T extends object> extends HandlerBaseRule<T> {
  run() {
    // @ts-expect-error
    return this.handler.call(this.context);
  }

  shouldHandle(): boolean {
    return this.shouldRunWithoutArgs();
  }
}
