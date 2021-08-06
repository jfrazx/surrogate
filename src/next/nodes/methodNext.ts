import { MethodContainer } from '../../containers';
import { ContextController } from '../context';
import { SurrogateProxy } from '../../proxy';
import { FinalNext } from './finalNext';
import { Which } from '../../which';

export class MethodNext<T extends object> extends FinalNext<T> {
  constructor(controller: ContextController<T>, proxy: SurrogateProxy<T>, hookType: Which) {
    super(controller, proxy, new MethodContainer<T>(controller.context.original), hookType);
  }
}
