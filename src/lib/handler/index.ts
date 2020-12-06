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
    const { handler, options } = container;
    const { useNext } = options;

    const useContext = context.determineContext(options);
    const useArgs = ArgumentRuleRunner.generateArgumentsFromRules(this.node, args, error);

    useNext
      ? this.runWithNext(handler, useContext, useArgs)
      : this.runWithoutNext(handler, useContext, useArgs);
  }

  protected runWithNext(handler: Function, context: any, args: any[]): void {
    handler.apply(context, args);
  }

  protected abstract runWithoutNext(handler: Function, context: any, args: any[]): void;
}

class AsyncHandlerRunner<T extends object> extends HandlerRunner<T> {
  protected runWithoutNext(handler: Function, context: any, args: any[]): void {
    const { nextNode } = this.node;

    handler
      .apply(context, args)
      .then((result: any) => nextNode.next({ using: asArray(result) }));
  }
}

class SyncHandlerRunner<T extends object> extends HandlerRunner<T> {
  protected runWithoutNext(handler: Function, context: any, args: any[]): void {
    const { nextNode } = this.node;

    const result = handler.apply(context, args);

    nextNode.next({ using: asArray(result) });
  }
}
