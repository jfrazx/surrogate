import { SurrogateCallback } from './types';
import { Next } from './next';

export class SurrogateHandler<T extends object> {
  constructor(
    private handler: Next<T>,
    private interator: Generator<SurrogateCallback>,
  ) {}

  next(error: Error = null): void {
    this.handler.next({ error });
  }

  skip(times = 1): void {
    while (times-- > 0) {
      this.interator.next();
    }

    this.next();
  }

  complete() {
    let done;
    do {
      done = this.interator.next().done;
    } while (!done);

    this.next();
  }
}
