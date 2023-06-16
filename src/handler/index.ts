import { HandlerConstructor, WithArgsRule, WithoutArgsRule } from './rules';
import type { OptionsHandler } from '../options';
import { MethodWrapper } from '../constants';
import { NextProvider } from '../provider';
import { asArray } from '@jfrazx/asarray';
import type { NextNode } from '../next';

export interface SurrogateHandlerRunner {
  run(args: any[], error?: Error): void;
}

export abstract class HandlerRunner<T extends object> implements SurrogateHandlerRunner {
  protected argsHandlers: HandlerConstructor<T>[] = [WithArgsRule, WithoutArgsRule];

  constructor(protected node: NextNode<T>) {}

  static for<T extends object>(
    node: NextNode<T>,
    options: OptionsHandler<T>,
  ): SurrogateHandlerRunner {
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
      .map((Rule: HandlerConstructor<T>) => new Rule(this.node))
      .find((rule) => rule.shouldHandle())!;
  }

  protected abstract runWithoutNext(nextProvider: NextProvider<T>): void;
  protected abstract runWithNext(nextProvider: NextProvider<T>): void;

  protected shouldRunWithNext(): boolean {
    const { useNext, noArgs } = this.node.container.options;

    return useNext && !noArgs;
  }
}

class AsyncHandlerRunner<T extends object> extends HandlerRunner<T> {
  protected async runWithoutNext(nextProvider: NextProvider<T>) {
    try {
      const result = await this.findRule().run(nextProvider);

      this.node.next({ using: asArray(result) });
    } catch (error: any) {
      this.node.next({ error });
    }
  }

  protected async runWithNext(nextProvider: NextProvider<T>) {
    try {
      await this.findRule().run(nextProvider);
    } catch (error: any) {
      this.node.next({ error });
    }
  }
}

class SyncHandlerRunner<T extends object> extends HandlerRunner<T> {
  protected runWithoutNext(nextProvider: NextProvider<T>): void {
    try {
      const result = this.findRule().run(nextProvider);

      this.node.next({ using: asArray(result) });
    } catch (error: any) {
      this.node.next({ error });
    }
  }

  protected runWithNext(nextProvider: NextProvider<T>): void {
    try {
      this.findRule().run(nextProvider);
    } catch (error: any) {
      this.node.next({ error });
    }
  }
}
