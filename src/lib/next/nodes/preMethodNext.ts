import { ContainerGenerator, IContainer, MethodContainer } from '../../containers';
import { INext, NextOptions } from '../interfaces';
import { SurrogateProxy } from '../../proxy';
import { nextOptionDefaults } from './lib';
import { MethodNext } from './methodNext';
import { FinalNext } from './finalNext';
import { Context } from '../../context';
import { Execution } from '../context';

export class PreMethodNext<T extends object> extends FinalNext<T> implements INext<T> {
  constructor(
    proxy: SurrogateProxy<T>,
    context: Context<T>,
    controller: Execution<T>,
    generator: ContainerGenerator<T>,
    container: IContainer<T>,
    args: any[],
  ) {
    super(proxy, context, controller, generator, container);

    this.nextNode = new MethodNext(
      proxy,
      context,
      controller,
      generator,
      new MethodContainer(context.original, args),
    );
  }

  next(nextOptions: NextOptions = {}): void {
    const useNextOptions = { ...nextOptionDefaults, ...nextOptions };
    const { error, using, bail } = useNextOptions;

    this.didBail = bail ?? this.didBail;

    if (error) {
      return this.nextError(error, ...using);
    }

    if (bail) {
      return this.controller.bail(this, useNextOptions.bailWith);
    }

    return this.controller.runOriginal(this.nextNode);
  }
}
