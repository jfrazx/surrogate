import { NextHandler } from '../../../interfaces';
import { NextNode } from '../../../next';

export interface HandlerRule<T extends object> {
  shouldRun(): boolean;
  run(nextHandler?: NextHandler<T>): any;
}
export interface AsyncHandlerRule<T extends object> extends HandlerRule<T> {
  run(nextHandler?: NextHandler<T>): Promise<any>;
}

export interface HandlerConstructor<T extends object> {
  new (node: NextNode<T>): HandlerRule<T>;
}

export interface AsyncHandlerConstructor<T extends object> {
  new (node: NextNode<T>): AsyncHandlerRule<T>;
}
