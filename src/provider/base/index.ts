import { ProviderParameters } from '../../interfaces';
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

  get instance() {
    return this.node.instance;
  }

  get hookType() {
    return this.node.hookType;
  }

  get originalArgs() {
    return this.context.originalArguments;
  }

  get currentArgs() {
    return this.node.controller.currentArgs;
  }

  get result() {
    return this.returnValue;
  }

  get timeTracker() {
    return this.node.controller.timeTracker;
  }
}
