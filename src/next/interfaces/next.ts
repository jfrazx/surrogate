import { SurrogateUnwrapped, Surrogate } from '../../interfaces';
import { ContextController } from '../context';
import { IContainer } from '../../containers';
import { NextOptions } from './nextOptions';
import { Context } from '../../context';

export interface INext<T extends object> {
  surrogate: Surrogate<T>;
  skip(times?: number): void;
  instance: SurrogateUnwrapped<T>;
  next({ error, using }?: NextOptions): void;
  skipWith(times?: number, ...args: any[]): void;
}

export interface NextNode<T extends object> extends INext<T> {
  nextError(error: Error, using: any[], nextOptions: NextOptions): void;
  shouldRun(using: any[]): boolean;
  addNext(next: NextNode<T>): void;
  controller: ContextController<T>;
  container: IContainer<T>;
  nextNode: NextNode<T>;
  prevNode: NextNode<T>;
  context: Context<T>;
  didError: Error;
}
