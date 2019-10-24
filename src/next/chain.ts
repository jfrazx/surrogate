import { INext } from '../interfaces';

export class NextChain {
  constructor(
    private pre: INext,
    private post: INext,
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

  private runNext(next: INext) {
    next.next();
  }
}
