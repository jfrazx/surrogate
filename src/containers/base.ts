import { SurrogateHandler, SurrogateHandlerTypes } from '../interfaces';
import { HandlerRunner, SurrogateHandlerRunner } from '../handler';
import { NextNode } from '../next/interfaces/next';
import { OptionsHandler } from '../options';
import { IContainer } from './interfaces';
import { isFunction } from '../helpers';
import { WhichMethod } from '../which';
import { Context } from '../context';

export abstract class BaseContainer<T extends object> implements IContainer<T> {
  constructor(
    protected handler: SurrogateHandlerTypes<T> | Function,
    public type: WhichMethod,
    public options: OptionsHandler<T> = new OptionsHandler(),
  ) {}

  getHandler({ target, receiver }: Context<T>): Function | SurrogateHandler<T> {
    return isFunction(this.handler)
      ? this.handler
      : Reflect.get(target, this.handler, receiver);
  }

  getHandlerRunner(node: NextNode<T>): SurrogateHandlerRunner {
    return HandlerRunner.for(node, this.options);
  }
}
