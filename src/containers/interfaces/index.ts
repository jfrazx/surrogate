import type { SurrogateHandlerRunner } from '../../handler';
import type { SurrogateHandler } from '../../interfaces';
import type { OptionsHandler } from '../../options';
import type { WhichMethod } from '../../which';
import type { Context } from '../../context';
import type { NextNode } from '../../next';

export interface HandlerContainer<T extends object> {
  type: WhichMethod;
  options: OptionsHandler<T>;
  getHandlerRunner(node: NextNode<T>): SurrogateHandlerRunner;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type -- handlers and wrapped methods are arbitrary user functions
  getHandler(context: Context<T>): SurrogateHandler<T> | Function;
}
