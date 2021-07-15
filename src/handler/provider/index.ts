import { NextNode } from '../../next/interfaces/next';
import { NextHandler } from '../../interfaces';
import { Context } from '../../context';

export class NextHandlerProvider<T extends object> implements NextHandler<T> {
  private readonly context: Context<T>;

  constructor(
    private readonly node: NextNode<T>,
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

  get surrogate() {
    return this.context.receiver;
  }

  get hookType() {
    return this.node.hookType;
  }

  get originalArgs() {
    return this.node.controller.originalArgs;
  }

  get next() {
    return this.node.nextNode;
  }

  get result() {
    return this.node.controller.returnValue;
  }

  get timeTracker() {
    return this.node.controller.timeTracker;
  }

  get currentArgs() {
    return this.node.controller.currentArgs;
  }
}
