import type { ContextController } from '../context';
import type { HandlerContainer } from '../../containers';
import type { SurrogateProxy } from '../../proxy';
import type { INext } from '../interfaces';
import { MethodNext } from './methodNext';
import type { Which } from '../../which';
import { FinalNext } from './finalNext';

export class PreMethodNext<T extends object> extends FinalNext<T> implements INext {
  constructor(
    controller: ContextController<T>,
    proxy: SurrogateProxy<T>,
    container: HandlerContainer<T>,
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
