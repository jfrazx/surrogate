import { SurrogateUnwrapped, Contexts } from '../../interfaces';
import { ContextController } from '../context';
import { IContainer } from '../../containers';
import { NextOptions } from './nextOptions';
import { Context } from '../../context';

export interface INext {
  skip(skipAmount?: number): void;
  next(nextOptions?: NextOptions): void;
  skipWith(skipAmount?: number, ...args: any[]): void;
}

export interface NextNode<T extends object> extends INext {
  handleNext(options?: NextOptions): void;
  shouldRun(using: any[]): boolean;
  addNext(next: NextNode<T>): void;
  controller: ContextController<T>;
  instance: SurrogateUnwrapped<T>;
  container: IContainer<T>;
  nextNode: NextNode<T>;
  prevNode: NextNode<T>;
  useContext: Contexts;
  context: Context<T>;
  hookType: string;
  didError: Error;
}
