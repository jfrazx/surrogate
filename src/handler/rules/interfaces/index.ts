import { NextParameters, ShouldHandle } from '../../../interfaces';
import { NextNode } from '../../../next';

export interface HandlerRule<T extends object> extends ShouldHandle {
  run(nextParameters?: NextParameters<T>): any;
}

export interface HandlerConstructor<T extends object> {
  new (node: NextNode<T>): HandlerRule<T>;
}
