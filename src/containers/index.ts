import { ContextController, NextConstruct } from '../next';
import { TailGeneration } from './interfaces';
import { SurrogateProxy } from '../proxy';
import { FinalNext } from '../next/nodes';
import { EmptyContainer } from './empty';
import { PreMethodNext } from '../next';
import { PRE, Which } from '../which';
import { Context } from '../context';

export abstract class Tail {
  static for<T extends object>(which: Which, args?: any[]): TailGeneration<T> {
    const Next = which === PRE ? PreMethodNext : FinalNext;

    return this.tailGeneration<T>(Next, which, args);
  }

  private static tailGeneration<T extends object>(
    Next: NextConstruct<T>,
    hookType: Which,
    args?: any[],
  ): TailGeneration<T> {
    return (proxy: SurrogateProxy<T>, context: Context<T>, controller: ContextController<T>) =>
      new Next(proxy, context, controller, new EmptyContainer(), hookType, args);
  }
}

export * from './interfaces';
export * from './empty';
export * from './handler';
export * from './method';
