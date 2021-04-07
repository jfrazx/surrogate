import { MethodWrapper, SurrogateHandler } from '../interfaces';
import { NextHandlerProvider } from './nextHandlerProvider';
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
    const nextHandler = new NextHandlerProvider(this.node, args, error);

    const runner = useNext && handler.length ? this.runWithNext : this.runWithoutNext;

    runner.call(this, handler as SurrogateHandler<T>, useContext, nextHandler);
  }

  protected runWithNext(
    handler: SurrogateHandler<T>,
    context: any,
    nextHandler: NextHandlerProvider<T>,
  ): void {
    handler.call(context, nextHandler);
  }

  protected abstract runWithoutNext(
    handler: SurrogateHandler<T>,
    context: any,
    nextHandler: NextHandlerProvider<T>,
  ): void;
}

class AsyncHandlerRunner<T extends object> extends HandlerRunner<T> {
  protected runWithoutNext(
    handler: Function,
    context: any,
    nextHandler: NextHandlerProvider<T>,
  ): void {
    const { nextNode } = this.node;

    handler
      .call(context, nextHandler)
      .then((result: any) => nextNode.next({ using: asArray(result) }));
  }
}

class SyncHandlerRunner<T extends object> extends HandlerRunner<T> {
  protected runWithoutNext(
    handler: SurrogateHandler<T>,
    context: any,
    nextHandler: NextHandlerProvider<T>,
  ): void {
    const { nextNode } = this.node;

    const result = handler.call(context, nextHandler);

    nextNode.next({ using: asArray(result) });
  }
}
