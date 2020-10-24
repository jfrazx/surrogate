import { NextOptions } from './nextOptions';
import { Context } from '../../context';

export interface INext<T extends object> {
  instance: T;
  context: Context<T>;
  skip(times?: number): void;
  skipWith(times?: number, ...args: any[]): void;
  next({ error, using }?: NextOptions): void;
}
