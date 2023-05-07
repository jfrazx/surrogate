import type { INext, NextOptions, NextNode, BailOptions } from '../interfaces';
import { ErrorRule, BailRule, NextRule, ProgressRule } from './rules';
import type { SurrogateUnwrapped } from '../../interfaces';
import type { SurrogateProxy } from '../../proxy/handler';
import { RunConditionProvider } from '../../provider';
import type { ContextController } from '../context';
import type { HandlerContainer } from '../../containers';
import { Which, HookType } from '../../which';
import { asArray } from '@jfrazx/asarray';

export interface NextConstruct<T extends object> {
  new (
    controller: ContextController<T>,
    proxy: SurrogateProxy<T>,
    container: HandlerContainer<T>,
    hookFor: Which,
  ): NextNode<T>;
}

export abstract class BaseNext<T extends object> implements INext {
  public nextNode: NextNode<T> = null;
  public prevNode: NextNode<T> = null;
  public didError: Error = null;

  constructor(
    public controller: ContextController<T>,
    public proxy: SurrogateProxy<T>,
    public container: HandlerContainer<T>,
    public hookFor: Which,
  ) {
    controller.addNext(this);
  }

  skip(times: number = 1): void {
    return this.skipWith(times);
  }

  next({ using = [], ...options }: NextOptions = {}): void {
    this.controller.timeTracker.setHookEnd();
    this.replace(options);

    const rules: NextRule<T>[] = [
      new ErrorRule({ ...options, using }),
      new BailRule({ ...options, using }),
      new ProgressRule({ ...options, using }),
    ];

    const rule = rules.find((rule) => rule.shouldRun());

    rule.run(this);
  }

  shouldRun(using: any[]): boolean {
    const runParameters = new RunConditionProvider(this, using, this.prevNode?.didError);
    const { options } = this.container;
    const context = this.useContext;

    return asArray(options.runConditions).every((condition) => {
      const result = condition.call(context, runParameters);

      runParameters.reset();

      return result;
    });
  }

  get instance(): SurrogateUnwrapped<T> {
    return this.context.target as SurrogateUnwrapped<T>;
  }

  get hookType(): HookType {
    return this.hookFor === HookType.PRE ? HookType.PRE : HookType.POST;
  }

  get context() {
    return this.controller.context;
  }

  addNext(next: NextNode<T>): void {
    if (this.nextNode) {
      return this.nextNode.addNext(next);
    }

    this.nextNode = next;
    next.prevNode = this;
  }

  get useContext() {
    return this.context.determineContext(this.container.options);
  }

  private shouldReplace(options: NextOptions): boolean {
    return 'replace' in options;
  }

  protected replace(options: NextOptions): void {
    if (this.shouldReplace(options)) {
      this.controller.updateLatestArgs(options.replace);
    }
  }

  bail(bailOptions: BailOptions = {}): void {
    this.next({ ...bailOptions, bail: true });
  }

  abstract skipWith(times?: number, ...args: any[]): void;
  abstract handleNext(options?: NextOptions): void;
}
