import type { SurrogateUnwrapped, Contexts } from '../../interfaces';
import type { NextOptions, BailOptions } from './nextOptions';
import type { ContextController } from '../context';
import type { HandlerContainer } from '../../containers';
import type { SurrogateProxy } from '../../proxy';
import type { Context } from '../../context';

export interface INext {
  skip(skipAmount?: number): void;
  bail(bailOptions?: BailOptions): void;
  next(nextOptions?: NextOptions): void;
  skipWith(skipAmount?: number, ...args: any[]): void;
}

export interface NextNode<T extends object> extends INext {
  handleNext(options?: NextOptions): void;
  shouldRun(using: any[]): boolean;
  addNext(next: NextNode<T>): void;
  controller: ContextController<T>;
  instance: SurrogateUnwrapped<T>;
  container: HandlerContainer<T>;
  proxy: SurrogateProxy<T>;
  nextNode: NextNode<T>;
  prevNode: NextNode<T>;
  useContext: Contexts;
  context: Context<T>;
  hookType: string;
  didError: Error;
}
