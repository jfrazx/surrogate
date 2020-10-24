import { INext } from './interfaces';

export class NextChain<T extends object> {
  constructor(
    private pre: INext<T>,
    private post: INext<T>,
    private original: Function,
    private args: any[],
  ) {}

  start() {
    const { context } = this.pre;

    this.runNext(this.pre);

    const result = this.original.call(context.target, ...this.args);

    this.runNext(this.post);

    return result;
  }

  private runNext(next: INext<T>) {
    next.next();
  }
}
