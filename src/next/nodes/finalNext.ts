import { INext, NextOptions } from '../interfaces';
import { nextOptionDefaults } from './lib';
import { BaseNext } from './baseNext';

export class FinalNext<T extends object> extends BaseNext<T> implements INext<T> {
  skipWith(_times?: number, ...args: any[]): void {
    return this.next({ using: args });
  }

  next(nextOptions: NextOptions = {}): void {
    const useOptions = { ...nextOptionDefaults, ...nextOptions };
    const { error, using } = useOptions;

    if (error) {
      return this.nextError(error, using, useOptions);
    }

    this.controller.complete(this, using);
  }
}
