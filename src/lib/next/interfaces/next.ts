import { Unwrapped } from '../../interfaces';
import { NextOptions } from './nextOptions';
import { Context } from '../../context';

export interface INext<T extends object> {
  didBail: boolean;
  context: Context<T>;
  instance: Unwrapped<T>;
  skip(times?: number): void;
  next({ error, using }?: NextOptions): void;
  skipWith(times?: number, ...args: any[]): void;
}

export interface NextNode<T extends object> extends INext<T> {
  addNext(next: NextNode<T>): void;
  nextNode: NextNode<T>;
}