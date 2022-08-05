import { SurrogateHandler, SurrogateHandlerTypes } from 'interfaces';
import { HandlerRunner, SurrogateHandlerRunner } from '../handler';
import { OptionsHandler } from '../options';
import { IContainer } from './interfaces';
import { isFunction } from '../helpers';
import { WhichMethod } from '../which';
import { Context } from '../context';
import { NextNode } from '../next';

export abstract class BaseContainer<T extends object> implements IContainer<T> {
  constructor(
    protected handler: SurrogateHandlerTypes<T> | Function,
    public type: WhichMethod,
    public options: OptionsHandler<T> = new OptionsHandler(),
  ) {}

  getHandler(context: Context<T>): Function | SurrogateHandler<T> {
    const { target, receiver } = context;
    const handler = this.handler as string;

    return this.shouldReflect
      ? this.shouldReflectSurrogate(context)
        ? Reflect.get(receiver, handler, receiver)
        : Reflect.get(target, handler, receiver)
      : this.handler;
  }

  private get shouldReflect() {
    return !isFunction(this.handler);
  }

  private shouldReflectSurrogate(context: Context<T>) {
    return context.useSurrogate(this.options.useContext);
  }

  getHandlerRunner(node: NextNode<T>): SurrogateHandlerRunner {
    return HandlerRunner.for(node, this.options);
  }
}
