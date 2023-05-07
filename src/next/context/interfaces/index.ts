import type { WhichContainers } from '../../../interfaces';
import type { TimeTracking } from '../../../timeTracker';
import type { SurrogateProxy } from '../../../proxy';
import type { NextNode } from '../../interfaces';
import type { Context } from '../../../context';

export interface ContextController<T extends object> {
  start(): any;
  complete(): void;
  returnValue: any;
  currentArgs: any[];
  context: Context<T>;
  correlationId: string;
  bail(bailWith: any): any;
  timeTracker: TimeTracking;
  addNext(next: NextNode<T>): void;
  setNext(next: NextNode<T>): void;
  runOriginal(node: NextNode<T>): void;
  updateLatestArgs(updatedArgs: any): void;
  handleError(node: NextNode<T>, error?: Error): never | void;
  setupPipeline(
    proxy: SurrogateProxy<T>,
    typeContainers: WhichContainers<T>,
  ): ContextController<T>;
}
