import { NextHandler, ShouldHandle } from '../../../interfaces';
import { NextNode } from '../../../next';

export interface HandlerRule<T extends object> extends ShouldHandle {
  run(nextHandler?: NextHandler<T>): any;
}
export interface AsyncHandlerRule<T extends object> extends ShouldHandle {
  run(nextHandler?: NextHandler<T>): Promise<any>;
}

export interface HandlerConstructor<T extends object> {
  new (node: NextNode<T>): HandlerRule<T>;
}

export interface AsyncHandlerConstructor<T extends object> {
  new (node: NextNode<T>): AsyncHandlerRule<T>;
}
