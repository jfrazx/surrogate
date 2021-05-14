import { ContainerGenerator, IContainer, MethodContainer } from '../../containers';
import { NextRule, ErrorRule, MethodRule, BailRule } from './rules';
import { INext, NextOptions } from '../interfaces';
import { ContextController } from '../context';
import { SurrogateProxy } from '../../proxy';
import { nextOptionDefaults } from './lib';
import { MethodNext } from './methodNext';
import { FinalNext } from './finalNext';
import { Context } from '../../context';
import { Which } from '../../which';

export class PreMethodNext<T extends object> extends FinalNext<T> implements INext {
  constructor(
    proxy: SurrogateProxy<T>,
    context: Context<T>,
    controller: ContextController<T>,
    generator: ContainerGenerator<T>,
    container: IContainer<T>,
    hookType: Which,
    args: any[],
  ) {
    super(proxy, context, controller, generator, container, hookType);

    this.nextNode = new MethodNext(
      proxy,
      context,
      controller,
      generator,
      new MethodContainer(context.original, args, container.options),
      hookType,
    );
  }

  next(nextOptions: NextOptions = {}): void {
    const useNextOptions = { ...nextOptionDefaults, ...nextOptions };
    const { error, using } = useNextOptions;

    this.setPrevContainerOptions();

    const rules: NextRule<T>[] = [
      new ErrorRule(error, using, useNextOptions),
      new BailRule(useNextOptions),
      new MethodRule(),
    ];

    const rule = rules.find((runner) => runner.shouldRun());

    rule.run(this);
  }

  private setPrevContainerOptions() {
    const { container } = this;
    const { options } = container;
    const preOptions = this.prevNode?.container.options ?? {};

    container.options = options.replace(preOptions);
  }
}
