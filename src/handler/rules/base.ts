import { SurrogateHandler, NextHandler } from '../../interfaces';
import { HandlerRule } from './interfaces';
import { NextNode } from '../../next';

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

  protected get handler() {
    return this.node.container.handler as SurrogateHandler<T>;
  }

  protected get context() {
    const { context } = this.node;

    return context.determineContext(this.options);
  }

  abstract run(nextHandler?: NextHandler<T>): any;
  abstract shouldRun(): boolean;
}
