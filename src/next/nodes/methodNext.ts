import type { ContextController } from '../context';
import { MethodContainer } from '../../containers';
import type { SurrogateProxy } from '../../proxy';
import type { Which } from '../../which';
import { FinalNext } from './finalNext';

export class MethodNext<T extends object> extends FinalNext<T> {
  constructor(controller: ContextController<T>, proxy: SurrogateProxy<T>, hookType: Which) {
    super(controller, proxy, new MethodContainer<T>(controller.context.original), hookType);
  }
}
