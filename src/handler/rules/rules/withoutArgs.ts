import { HandlerBaseRule } from '../base';

export class WithoutArgsRule<T extends object> extends HandlerBaseRule<T> {
  run() {
    // @ts-expect-error -- noArgs handlers are deliberately called without their provider
    return this.handler.call(this.context);
  }

  shouldHandle(): boolean {
    return this.shouldRunWithoutArgs();
  }
}
