import { BaseNext } from './baseNext';
import { INext } from '../interfaces';

export class FinalNext<T extends object> extends BaseNext<T> implements INext {
  skipWith(): void {
    return this.handleNext();
  }

  handleNext(): void {
    this.controller.complete();
  }
}
