import { ProviderParameters } from 'interfaces';
import { Context } from '../../context';
import { NextNode } from '../../next';

export abstract class Provider<T extends object> implements ProviderParameters<T> {
  protected readonly context: Context<T>;
  protected readonly returnValue: any;

  constructor(
    protected readonly node: NextNode<T>,
    public readonly receivedArgs: any[],
    public readonly error?: Error,
  ) {
    this.context = node.context;
    this.returnValue = this.node.controller.returnValue;
  }

  get action() {
    return this.context.event;
  }

  get correlationId() {
    return this.node.controller.correlationId;
  }

  get currentArgs() {
    return this.node.controller.currentArgs;
  }

  get hookType() {
    return this.node.hookType;
  }

  get instance() {
    return this.node.instance;
  }

  get originalArgs() {
    return this.context.originalArguments;
  }

  get provide() {
    return this.node.container.options.provide;
  }

  get result() {
    return this.returnValue;
  }

  get timeTracker() {
    return this.node.controller.timeTracker;
  }
}
