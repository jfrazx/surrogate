import { NextNode, ContextController } from '../../next';
import { SurrogateHandler } from '../../interfaces';
import { WhichMethod, Which } from '../../which';
import { OptionsHandler } from '../../options';
import { HandlerContainer } from '../handler';
import { SurrogateProxy } from '../../proxy';
import { Context } from '../../context';

export interface IContainer<T extends object> {
  type: WhichMethod;
  options: OptionsHandler<T>;
  handler: SurrogateHandler<T> | Function;
}

export interface ContainerGeneratorResults<T extends object> {
  value: HandlerContainer<T>;
  done: boolean;
}

export type TailGeneration<T extends object> = (
  proxy: SurrogateProxy<T>,
  context: Context<T>,
  controller: ContextController<T>,
  generator: ContainerGenerator<T>,
  hookType: Which,
) => NextNode<T>;

export type ContainerGenerator<T extends object> = Generator<
  HandlerContainer<T>,
  TailGeneration<T>,
  ContainerGeneratorResults<T>
>;
