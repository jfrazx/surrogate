import { SurrogateHandlerRunner } from '../../handler';
import { SurrogateHandler } from '../../interfaces';
import { OptionsHandler } from '../../options';
import { WhichMethod } from '../../which';
import { Context } from '../../context';
import { NextNode } from '../../next';

export interface IContainer<T extends object> {
  type: WhichMethod;
  options: OptionsHandler<T>;
  getHandlerRunner(node: NextNode<T>): SurrogateHandlerRunner;
  getHandler(context: Context<T>): SurrogateHandler<T> | Function;
}
