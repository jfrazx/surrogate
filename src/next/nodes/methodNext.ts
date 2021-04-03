import { MethodContainer, ContainerGenerator } from '../../containers';
import { ContextController } from '../context';
import { SurrogateProxy } from '../../proxy';
import { FinalNext } from './finalNext';
import { Context } from '../../context';
import { Which } from '../../which';

export class MethodNext<T extends object> extends FinalNext<T> {
  constructor(
    proxy: SurrogateProxy<T>,
    context: Context<T>,
    controller: ContextController<T>,
    generator: ContainerGenerator<T>,
    public container: MethodContainer<T>,
    hookType: Which,
  ) {
    super(proxy, context, controller, generator, container, hookType);
  }

  next() {}
}
