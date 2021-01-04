import { NextNode } from '../../interfaces';

export interface Execution<T extends object> {
  start(): any;
  originalArgs: any[];
  bail(bailWith: any): any;
  originalMethod: Function;
  addNext(next: NextNode<T>): void;
  setNext(next: NextNode<T>): void;
  runOriginal(node: NextNode<T>): void;
  complete(node: NextNode<T>, using: any[]): void;
}
