import { IContainer } from '../../containers';
import { SurrogateUnwrapped } from '../../interfaces';
import { NextOptions } from './nextOptions';
import { Context } from '../../context';

export interface INext<T extends object> {
  skip(times?: number): void;
  instance: SurrogateUnwrapped<T>;
  next({ error, using }?: NextOptions): void;
  skipWith(times?: number, ...args: any[]): void;
}

export interface NextNode<T extends object> extends INext<T> {
  addNext(next: NextNode<T>): void;
  container: IContainer<T>;
  nextNode: NextNode<T>;
  prevNode: NextNode<T>;
  context: Context<T>;
}
