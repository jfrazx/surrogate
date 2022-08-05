import { ContextController } from '../context';
import { IContainer } from '../../containers';
import { SurrogateProxy } from '../../proxy';
import { MethodNext } from './methodNext';
import { FinalNext } from './finalNext';
import { INext } from '../interfaces';
import { Which } from '../../which';

export class PreMethodNext<T extends object> extends FinalNext<T> implements INext {
  constructor(
    controller: ContextController<T>,
    proxy: SurrogateProxy<T>,
    container: IContainer<T>,
    hookType: Which,
  ) {
    super(controller, proxy, container, hookType);

    this.nextNode = new MethodNext(controller, proxy, hookType);
  }

  handleNext(): void {
    this.controller.setNext(this.nextNode);
    this.controller.runOriginal(this.nextNode);
  }
}
