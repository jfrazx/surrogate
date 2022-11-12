import type { ProviderParameters, SurrogateUnwrapped } from '../../interfaces';
import type { TimeTracking } from 'timeTracker';
import type { Context } from '../../context';
import type { NextNode } from '../../next';

export abstract class Provider<T extends object> implements ProviderParameters<T> {
  protected readonly returnValue: any;

  constructor(
    protected readonly node: NextNode<T>,
    public readonly receivedArgs: any[],
    public readonly error?: Error,
  ) {
    this.returnValue = this.node.controller.returnValue;
  }

  get action(): string {
    return this.context.event;
  }

  get correlationId(): string {
    return this.node.controller.correlationId;
  }

  get currentArgs(): any[] {
    return this.node.controller.currentArgs;
  }

  get hookType(): string {
    return this.node.hookType;
  }

  get instance(): SurrogateUnwrapped<T> {
    return this.node.instance;
  }

  get originalArgs() {
    return this.context.originalArguments;
  }

  get provide(): any {
    return this.node.container.options.provide;
  }

  get result() {
    return this.returnValue;
  }

  get timeTracker(): TimeTracking {
    return this.node.controller.timeTracker;
  }

  protected get context(): Context<T> {
    return this.node.context;
  }
}
