import { ContextController, NextConstruct, FinalNext, NextNode, PreMethodNext } from '../next';
import { SurrogateProxy } from '../proxy';
import { EmptyContainer } from './empty';
import { PRE, Which } from '../which';

export abstract class Tail {
  static for<T extends object>(
    controller: ContextController<T>,
    proxy: SurrogateProxy<T>,
    which: Which,
  ): NextNode<T> {
    const Next: NextConstruct<T> = which === PRE ? PreMethodNext : FinalNext;

    return new Next(controller, proxy, new EmptyContainer(), which);
  }
}

export * from './interfaces';
export * from './empty';
export * from './handler';
export * from './method';
