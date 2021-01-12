import { SurrogateUnwrapped } from '../../interfaces';
import { IContainer } from '../../containers';
import { NextOptions } from './nextOptions';
import { Context } from '../../context';
import { Execution } from '../context';

export interface INext<T extends object> {
  skip(times?: number): void;
  instance: SurrogateUnwrapped<T>;
  next({ error, using }?: NextOptions): void;
  skipWith(times?: number, ...args: any[]): void;
}

export interface NextNode<T extends object> extends INext<T> {
  nextError(error: Error, using: any[], nextOptions: NextOptions): void;
  addNext(next: NextNode<T>): void;
  controller: Execution<T>;
  container: IContainer<T>;
  nextNode: NextNode<T>;
  prevNode: NextNode<T>;
  shouldRun(): boolean;
  context: Context<T>;
  didError: Error;
}
