import type { SurrogateHandlerRunner } from '../../handler';
import type { SurrogateHandler } from '../../interfaces';
import type { OptionsHandler } from '../../options';
import type { WhichMethod } from '../../which';
import type { Context } from '../../context';
import type { NextNode } from '../../next';

export interface IContainer<T extends object> {
  type: WhichMethod;
  options: OptionsHandler<T>;
  getHandlerRunner(node: NextNode<T>): SurrogateHandlerRunner;
  getHandler(context: Context<T>): SurrogateHandler<T> | Function;
}
