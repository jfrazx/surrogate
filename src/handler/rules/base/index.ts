import { SurrogateHandler, NextParameters } from '../../../interfaces';
import { HandlerRule } from '../interfaces';
import { NextNode } from '../../../next';

export abstract class HandlerBaseRule<T extends object> implements HandlerRule<T> {
  constructor(protected node: NextNode<T>) {}

  protected shouldRunWithoutArgs() {
    return this.options.noArgs;
  }

  protected shouldRunWithArgs() {
    return !this.shouldRunWithoutArgs();
  }

  protected get options() {
    return this.node.container.options;
  }

  // get shouldReflectSurrogate() {
  //   const { container, context } = this.node;

  //   return container.shouldReflect && context.useSurrogate(this.options.useContext);
  // }

  protected get handler() {
    const { container, context } = this.node;

    return container.getHandler(context) as SurrogateHandler<T>;
  }

  protected get context() {
    const { context } = this.node;

    return context.determineContext(this.options);
  }

  abstract run(NextProvider?: NextParameters<T>): any;
  abstract shouldHandle(): boolean;
}
