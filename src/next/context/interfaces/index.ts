import { TimeTracking } from '../../../timeTracker';
import { NextNode } from '../../interfaces';

export interface ContextController<T extends object> {
  start(): any;
  complete(): void;
  returnValue: any;
  currentArgs: any[];
  originalArgs: any[];
  bail(bailWith: any): any;
  originalMethod: Function;
  timeTracker: TimeTracking;
  addNext(next: NextNode<T>): void;
  setNext(next: NextNode<T>): void;
  runOriginal(node: NextNode<T>): void;
  handleError(error?: Error): never | void;
  updateLatestArgs(updatedArgs: any): void;
}
