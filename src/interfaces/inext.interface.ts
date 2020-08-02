import { NextOptions } from './next-options.interface';
import { Context } from '../lib';

export interface INext<T extends object> {
  instance: T;
  context: Context<T>;
  skip(times?: number): void;
  skipWith(times?: number, ...args: any[]): void;
  next({ error, using }?: NextOptions): void;
}
