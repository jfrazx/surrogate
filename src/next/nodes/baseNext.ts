import { ErrorRule, BailRule, NextRule, ProgressRule } from './rules';
import { SurrogateUnwrapped, HookType } from '../../interfaces';
import { INext, NextOptions, NextNode } from '../interfaces';
import { RunConditionProvider } from '../../provider';
import { SurrogateProxy } from '../../proxy/handler';
import { ContextController } from '../context';
import { IContainer } from '../../containers';
import { asArray } from '@jfrazx/asarray';
import { Which, PRE } from '../../which';

export interface NextConstruct<T extends object> {
  new (
    controller: ContextController<T>,
    proxy: SurrogateProxy<T>,
    container: IContainer<T>,
    hookFor: Which,
  ): NextNode<T>;
}

export abstract class BaseNext<T extends object> implements INext {
  public nextNode: NextNode<T> = null;
  public prevNode: NextNode<T> = null;
  public didError: Error = null;

  constructor(
    public controller: ContextController<T>,
    protected proxy: SurrogateProxy<T>,
    public container: IContainer<T>,
    public hookFor: Which,
  ) {
    controller.addNext(this);
  }

  skip(times: number = 1): void {
    return this.nextNode.skipWith(times);
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

  get hookType() {
    return this.hookFor === PRE ? HookType.PRE : HookType.POST;
  }

  get context() {
    return this.controller.context;
  }

  addNext(next: NextNode<T>) {
    if (this.nextNode) {
      return this.nextNode.addNext(next);
    }

    this.nextNode = next;
    next.prevNode = this;
  }

  get useContext() {
    return this.context.determineContext(this.container.options);
  }

  private shouldReplace(options: NextOptions) {
    return 'replace' in options;
  }

  protected replace(options: NextOptions) {
    if (this.shouldReplace(options)) {
      this.controller.updateLatestArgs(options.replace);
    }
  }

  abstract skipWith(times?: number, ...args: any[]): void;
  abstract handleNext(options?: NextOptions): void;
}
