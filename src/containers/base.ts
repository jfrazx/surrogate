import type { SurrogateHandler, SurrogateHandlerTypes } from 'interfaces';
import { HandlerRunner, SurrogateHandlerRunner } from '../handler';
import type { IContainer } from './interfaces';
import type { WhichMethod } from '../which';
import { OptionsHandler } from '../options';
import type { Context } from '../context';
import type { NextNode } from '../next';
import { isFunction } from '../helpers';

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
