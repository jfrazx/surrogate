import { ContainerGenerator, TailGeneration } from './interfaces';
import { Execution, NextConstruct } from '../next';
import { SurrogateProxy } from '../surrogateProxy';
import { HandlerContainer } from './handler';
import { PRE, POST, Which } from '../which';
import { FinalNext } from '../next/nodes';
import { EmptyContainer } from './empty';
import { PreMethodNext } from '../next';
import { Context } from '../context';

export const containerGenerator = function* <T extends object>(
  containers: HandlerContainer<T>[],
  finalGenerate: TailGeneration<T>,
) {
  for (const container of containers) {
    yield container;
  }

  return finalGenerate;
};

export abstract class Tail {
  static for<T extends object>(which: Which, args?: any[]): TailGeneration<T> {
    switch (which) {
      case PRE:
        return this.endGeneration(PreMethodNext, args);
      case POST:
        return this.endGeneration(FinalNext);
    }
  }
  private static endGeneration<T extends object>(
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
