import { HandlerBaseRule } from '../base';

export class WithoutArgsRule<T extends object> extends HandlerBaseRule<T> {
  run() {
    const { handler, context } = this;

    return handler.apply(context);
  }

  shouldHandle(): boolean {
    return this.shouldRunWithoutArgs();
  }
}
