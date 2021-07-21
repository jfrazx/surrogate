import { ProviderParameters } from '../../interfaces';
import { Context } from '../../context';
import { NextNode } from '../../next';

export class Provider<T extends object> implements ProviderParameters<T> {
  protected readonly context: Context<T>;

  constructor(
    protected readonly node: NextNode<T>,
    public readonly receivedArgs: any[],
    public readonly error?: Error,
  ) {
    this.context = node.context;
  }

  get action() {
    return this.context.event;
  }

  get instance() {
    return this.node.instance;
  }

  get hookType() {
    return this.node.hookType;
  }

  get originalArgs() {
    return this.node.controller.originalArgs;
  }

  get currentArgs() {
    return this.node.controller.currentArgs;
  }

  get result() {
    return this.node.controller.returnValue;
  }

  get timeTracker() {
    return this.node.controller.timeTracker;
  }
}
