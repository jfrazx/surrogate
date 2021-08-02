import { WhichContainers } from '../../../interfaces';
import { TimeTracking } from '../../../timeTracker';
import { SurrogateProxy } from '../../../proxy';
import { NextNode } from '../../interfaces';
import { Context } from '../../../context';

export interface ContextController<T extends object> {
  start(): any;
  complete(): void;
  returnValue: any;
  currentArgs: any[];
  originalArgs: any[];
  correlationId: string;
  bail(bailWith: any): any;
  originalMethod: Function;
  timeTracker: TimeTracking;
  addNext(next: NextNode<T>): void;
  setNext(next: NextNode<T>): void;
  runOriginal(node: NextNode<T>): void;
  handleError(error?: Error): never | void;
  updateLatestArgs(updatedArgs: any): void;
  setupPipeline(
    proxy: SurrogateProxy<T>,
    context: Context<T>,
    typeContainers: WhichContainers<T>,
  ): ContextController<T>;
}
