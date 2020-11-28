import { SurrogateHandler } from '../interfaces';
import { MethodWrapper } from '../interfaces';
import { ArgumentRuleRunner } from './rules';
import { asArray } from '@jfrazx/asarray';
import { NextNode } from '../next';

export abstract class HandlerRunner<T extends object> {
  constructor(protected node: NextNode<T>) {}
  static for<T extends object>(node: NextNode<T>) {
    const {
      container: { options },
    } = node;
    const { wrapper } = options;

    return wrapper === MethodWrapper.Async
      ? new AsyncHandlerRunner<T>(node)
      : new SyncHandlerRunner<T>(node);
  }

  run(args: any[], error?: Error) {
    const { container, context } = this.node;
    const {
      handler,
      options: { useNext },
    } = container;

    const useContext = container.determineContext(context);
    const useArgs = ArgumentRuleRunner.generateArgumentsFromRules(this.node, args, error);

    useNext
      ? this.runWithNext(handler as SurrogateHandler<T>, useContext, useArgs)
      : this.runWithoutNext(handler, useContext, useArgs);
  }

  protected runWithNext(handler: SurrogateHandler<T>, context: any, args: any[]): void {
    handler.call(context, ...args);
  }

  protected abstract runWithoutNext(
    handler: SurrogateHandler<T> | Function,
    context: any,
    args: any[],
  ): void;
}

class AsyncHandlerRunner<T extends object> extends HandlerRunner<T> {
  protected runWithoutNext(handler: SurrogateHandler<T>, context: any, args: any[]): void {
    const { nextNode } = this.node;

    handler
      .call(context, ...args)
      .then((result: any) => nextNode.next({ using: asArray(result) }));
  }
}

class SyncHandlerRunner<T extends object> extends HandlerRunner<T> {
  protected runWithoutNext(handler: SurrogateHandler<T>, context: any, args: any[]): void {
    const { nextNode } = this.node;
    const result = handler.call(context, ...args);

    nextNode.next({ using: asArray(result) });
  }
}
