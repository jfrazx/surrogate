import type { INext } from '../interfaces';
import { BaseNext } from './baseNext';

export class FinalNext<T extends object> extends BaseNext<T> implements INext {
  skipWith(): void {
    return this.handleNext();
  }

  handleNext(): void {
    this.controller.complete();
  }
}
