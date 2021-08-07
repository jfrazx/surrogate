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

  getHandler(context: Context<T>): Function | SurrogateHandler<T> {
    const { target, receiver } = context;

    return this.shouldReflect
      ? this.shouldReflectSurrogate(context)
        ? Reflect.get(receiver, this.handler as string)
        : Reflect.get(target, this.handler as string, receiver)
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
