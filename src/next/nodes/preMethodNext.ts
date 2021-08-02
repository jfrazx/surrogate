import { IContainer, MethodContainer } from '../../containers';
import { ContextController } from '../context';
import { SurrogateProxy } from '../../proxy';
import { MethodNext } from './methodNext';
import { FinalNext } from './finalNext';
import { Context } from '../../context';
import { INext } from '../interfaces';
import { Which } from '../../which';

export class PreMethodNext<T extends object> extends FinalNext<T> implements INext {
  constructor(
    proxy: SurrogateProxy<T>,
    context: Context<T>,
    controller: ContextController<T>,
    container: IContainer<T>,
    hookType: Which,
    args: any[],
  ) {
    super(proxy, context, controller, container, hookType);

    this.nextNode = new MethodNext(
      proxy,
      context,
      controller,
      new MethodContainer(context.original, args, container.options),
      hookType,
    );
  }

  handleNext(): void {
    this.controller.runOriginal(this.nextNode);
  }
}
