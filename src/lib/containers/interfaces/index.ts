import { SurrogateMethodOptions, SurrogateHandler } from '../../interfaces';
import { SurrogateProxy } from '../../surrogateProxy';
import { NextNode } from '../../next/interfaces';
import { Execution } from '../../next/context';
import { HandlerContainer } from '../handler';
import { WhichMethod } from '../../which';
import { Context } from '../../context';

export interface IContainer<T extends object> {
  type: WhichMethod;
  options: SurrogateMethodOptions<T>;
  handler: SurrogateHandler<T> | Function;
  determineContext(context: Context<T>): any;
}

export interface ContainerGeneratorResults<T extends object> {
  value: HandlerContainer<T>;
  done: boolean;
}

export type TailGeneration<T extends object> = (
  proxy: SurrogateProxy<T>,
  context: Context<T>,
  controller: Execution<T>,
  generator: ContainerGenerator<T>,
) => NextNode<T>;

export type ContainerGenerator<T extends object> = Generator<
  HandlerContainer<T>,
  TailGeneration<T>,
  ContainerGeneratorResults<T>
>;
