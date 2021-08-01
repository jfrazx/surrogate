import { NextNode, ContextController } from '../../next';
import { SurrogateHandler } from '../../interfaces';
import { OptionsHandler } from '../../options';
import { SurrogateProxy } from '../../proxy';
import { WhichMethod } from '../../which';
import { Context } from '../../context';

export interface IContainer<T extends object> {
  type: WhichMethod;
  options: OptionsHandler<T>;
  handler: SurrogateHandler<T> | Function;
}

export type TailGeneration<T extends object> = (
  proxy: SurrogateProxy<T>,
  context: Context<T>,
  controller: ContextController<T>,
) => NextNode<T>;
