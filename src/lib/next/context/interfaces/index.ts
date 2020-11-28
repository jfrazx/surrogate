import { NextNode } from '../../interfaces';

export interface Execution<T extends object> {
  start(): any;
  originalArgs: any[];
  originalMethod: Function;
  setNext(next: NextNode<T>): void;
  runOriginal(node: NextNode<T>): void;
  bail(next: NextNode<T>, bailWith: any): any;
  complete(node: NextNode<T>, using: any[]): void;
  setHooks(pre: NextNode<T>, post: NextNode<T>): this;
}
