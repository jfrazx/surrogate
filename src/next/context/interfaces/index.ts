import { TimeTracking } from '../../../timeTracker';
import { NextNode } from '../../interfaces';

export interface ContextController<T extends object> {
  start(): any;
  complete(): void;
  returnValue: any;
  originalArgs: any[];
  bail(bailWith: any): any;
  originalMethod: Function;
  timeTracker: TimeTracking;
  addNext(next: NextNode<T>): void;
  setNext(next: NextNode<T>): void;
  handleError(error?: Error): never | void;
  runOriginal(node: NextNode<T>): void;
}
