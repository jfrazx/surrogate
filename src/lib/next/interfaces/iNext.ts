import { Unwrapped } from '../../interfaces';
import { NextOptions } from './nextOptions';
import { Context } from '../../context';

export interface INext<T extends object> {
  didBail: boolean;
  context: Context<T>;
  instance: Unwrapped<T>;
  skip(times?: number): void;
  skipWith(times?: number, ...args: any[]): void;
  next({ error, using }?: NextOptions): void;
}
