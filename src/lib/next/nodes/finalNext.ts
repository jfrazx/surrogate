import { INext, NextOptions } from '../interfaces';
import { BaseNext } from './baseNext';

export class FinalNext<T extends object> extends BaseNext<T> implements INext<T> {
  skipWith(_times?: number, ...args: any[]): void {
    return this.next({ using: args });
  }

  next({ error, using }: NextOptions = { using: [] }): void {
    if (error) {
      return this.nextError(error, ...using);
    }

    this.controller.complete(this, using);
  }
}