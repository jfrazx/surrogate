import { NextOptions } from './next-options.interface';
import { Context } from '../context';

export interface INext {
  _next: INext;
  context: Context<any>;
  skip(times?: number): void;
  skipWith(times?: number, ...args: any[]): void;
  next({ error, using }?: NextOptions): void;
}
