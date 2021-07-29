import { MethodWrapper } from '../interfaces';
import { NextProvider } from '../provider';
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
    const nextProvider = new NextProvider(this.node, args, error);
    const { timeTracker } = this.node.controller;

    const runner = this.shouldRunWithNext() ? this.runWithNext : this.runWithoutNext;

    timeTracker.setHookStart();

    runner.call(this, nextProvider);
  }

  protected findRule() {
    return this.argsHandlers
      .map((Rule) => new Rule(this.node))
      .find((rule) => rule.shouldHandle());
  }

  protected runWithNext(nextProvider: NextProvider<T>): void {
    return this.findRule().run(nextProvider);
  }

  protected abstract runWithoutNext(nextProvider: NextProvider<T>): void;

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

  protected async runWithoutNext(nextProvider: NextProvider<T>) {
    const { nextNode } = this.node;

    try {
      const result = await this.findRule().run(nextProvider);

      nextNode.next({ using: asArray(result) });
    } catch (error) {
      nextNode.next({ error });
    }
  }
}

class SyncHandlerRunner<T extends object> extends HandlerRunner<T, HandlerConstructor<T>> {
  protected argsHandlers: HandlerConstructor<T>[] = [
    SyncHandlerWithArgsRule,
    SyncHandlerWithoutArgsRule,
  ];

  protected runWithoutNext(nextProvider: NextProvider<T>): void {
    const result = this.findRule().run(nextProvider);
    const { nextNode } = this.node;

    nextNode.next({ using: asArray(result) });
  }
}
