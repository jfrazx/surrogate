import type { SurrogateHandler, SurrogateHandlerTypes } from 'interfaces';
import { HandlerRunner, SurrogateHandlerRunner } from '../handler';
import type { HandlerContainer } from './interfaces';
import type { WhichMethod } from '../which';
import { OptionsHandler } from '../options';
import type { Context } from '../context';
import type { NextNode } from '../next';
import { isFunction } from '../helpers';

export abstract class BaseContainer<T extends object> implements HandlerContainer<T> {
  constructor(
    protected handler: SurrogateHandlerTypes<T> | Function,
    public type: WhichMethod,
    public options: OptionsHandler<T> = new OptionsHandler(),
  ) {}

  getHandler(context: Context<T>): Function | SurrogateHandler<T> {
    const { target, receiver } = context;

    return (
      this.shouldReflect(this.handler)
        ? this.shouldReflectSurrogate(context)
          ? /**
             * @note Removes ability to apply target only
             * @todo fix ^^
             */
            Reflect.get(receiver, this.handler, receiver)
          : Reflect.get(target, this.handler, receiver)
        : this.handler
    ) as Function | SurrogateHandler<T>;
  }

  private shouldReflect(value: unknown): value is string {
    return !isFunction(value);
  }

  private shouldReflectSurrogate(context: Context<T>) {
    return context.useSurrogate(this.options.useContext);
  }

  getHandlerRunner(node: NextNode<T>): SurrogateHandlerRunner {
    return HandlerRunner.for(node, this.options);
  }
}
