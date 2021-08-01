import { HandlerConstructor, WithArgsRule, WithoutArgsRule } from './rules';
import { MethodWrapper } from '../interfaces';
import { NextProvider } from '../provider';
import { asArray } from '@jfrazx/asarray';
import { NextNode } from '../next';

export abstract class HandlerRunner<T extends object> {
  protected argsHandlers: HandlerConstructor<T>[] = [WithArgsRule, WithoutArgsRule];

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

  protected abstract runWithoutNext(nextProvider: NextProvider<T>): void;
  protected abstract runWithNext(nextProvider: NextProvider<T>): void;

  protected shouldRunWithNext(): boolean {
    const {
      container: { handler, options },
    } = this.node;
    const { useNext, noArgs } = options;

    return useNext && Boolean(handler.length) && !noArgs;
  }
}

class AsyncHandlerRunner<T extends object> extends HandlerRunner<T> {
  protected async runWithoutNext(nextProvider: NextProvider<T>) {
    try {
      const result = await this.findRule().run(nextProvider);

      this.node.next({ using: asArray(result) });
    } catch (error) {
      this.node.next({ error });
    }
  }

  protected async runWithNext(nextProvider: NextProvider<T>) {
    try {
      await this.findRule().run(nextProvider);
    } catch (error) {
      this.node.next({ error });
    }
  }
}

class SyncHandlerRunner<T extends object> extends HandlerRunner<T> {
  protected runWithoutNext(nextProvider: NextProvider<T>): void {
    try {
      const result = this.findRule().run(nextProvider);

      this.node.next({ using: asArray(result) });
    } catch (error) {
      this.node.next({ error });
    }
  }

  protected runWithNext(nextProvider: NextProvider<T>): void {
    try {
      this.findRule().run(nextProvider);
    } catch (error) {
      this.node.next({ error });
    }
  }
}
