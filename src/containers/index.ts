import { ContainerGenerator, TailGeneration } from './interfaces';
import { Execution, NextConstruct } from '../next';
import { HandlerContainer } from './handler';
import { SurrogateProxy } from '../proxy';
import { FinalNext } from '../next/nodes';
import { EmptyContainer } from './empty';
import { PreMethodNext } from '../next';
import { PRE, Which } from '../which';
import { Context } from '../context';

export const containerGenerator = function* <T extends object>(
  containers: HandlerContainer<T>[],
  tailGenerator: TailGeneration<T>,
) {
  for (const container of containers) {
    yield container;
  }

  return tailGenerator;
};

export abstract class Tail {
  static for<T extends object>(which: Which, args?: any[]): TailGeneration<T> {
    const Next = which === PRE ? PreMethodNext : FinalNext;

    return this.tailGeneration<T>(Next, args);
  }

  private static tailGeneration<T extends object>(
    Next: NextConstruct<T>,
    args?: any[],
  ): TailGeneration<T> {
    return (
      proxy: SurrogateProxy<T>,
      context: Context<T>,
      controller: Execution<T>,
      generator: ContainerGenerator<T>,
    ) => new Next(proxy, context, controller, generator, new EmptyContainer(), args);
  }
}

export * from './interfaces';
export * from './empty';
export * from './handler';
export * from './method';
