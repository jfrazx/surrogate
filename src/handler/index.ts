import { NextHandlerProvider } from './provider';
import { MethodWrapper } from '../interfaces';
import { asArray } from '@jfrazx/asarray';
import { NextNode } from '../next';
import {
  HandlerConstructor,
  AsyncHandlerConstructor,
  SyncHandlerWithArgsRule,
  AsyncHandlerWithArgsRule,
  SyncHandlerWithoutArgsRule,
  AsyncHandlerWithoutArgsRule,
} from './rules';

export abstract class HandlerRunner<T extends object, R extends HandlerConstructor<T>> {
  protected abstract argsHandlers: R[];

  constructor(protected node: NextNode<T>) {}
  static for<T extends object>(node: NextNode<T>) {
    const {
      container: { options },
    } = node;

    return options.wrapper === MethodWrapper.Async
      ? new AsyncHandlerRunner<T>(node)
      : new SyncHandlerRunner<T>(node);
  }

  run(args: any[], error?: Error) {
    const nextHandler = new NextHandlerProvider(this.node, args, error);

    const runner = this.shouldRunWithNext() ? this.runWithNext : this.runWithoutNext;

    runner.call(this, nextHandler);
  }

  protected findRule() {
    return this.argsHandlers
      .map((Rule) => new Rule(this.node))
      .find((rule) => rule.shouldRun());
  }

  protected runWithNext(nextHandler: NextHandlerProvider<T>): void {
    return this.findRule().run(nextHandler);
  }

  protected abstract runWithoutNext(nextHandler: NextHandlerProvider<T>): void;

  protected shouldRunWithNext(): boolean {
    const {
      container: { handler, options },
    } = this.node;
    const { useNext, noArgs } = options;

    return useNext && Boolean(handler.length) && !noArgs;
  }
}

class AsyncHandlerRunner<T extends object> extends HandlerRunner<
  T,
  AsyncHandlerConstructor<T>
> {
  protected argsHandlers: AsyncHandlerConstructor<T>[] = [
    AsyncHandlerWithArgsRule,
    AsyncHandlerWithoutArgsRule,
  ];

  protected runWithoutNext(nextHandler: NextHandlerProvider<T>): void {
    const { nextNode } = this.node;
    const handlerPromise = this.findRule().run(nextHandler);

    handlerPromise.then((result: any) => nextNode.next({ using: asArray(result) }));
  }
}

class SyncHandlerRunner<T extends object> extends HandlerRunner<T, HandlerConstructor<T>> {
  protected argsHandlers: HandlerConstructor<T>[] = [
    SyncHandlerWithArgsRule,
    SyncHandlerWithoutArgsRule,
  ];

  protected runWithoutNext(nextHandler: NextHandlerProvider<T>): void {
    const result = this.findRule().run(nextHandler);
    const { nextNode } = this.node;

    nextNode.next({ using: asArray(result) });
  }
}
