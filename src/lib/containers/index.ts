import { HandlerContainer } from './handler';
import { IContainer } from './interfaces';

export const containerGenerator = function* <T extends object>(
  containers: HandlerContainer<T>[],
  original?: IContainer<T>,
) {
  for (const container of containers) {
    yield container;
  }

  return original;
};

export * from './interfaces';
export * from './empty';
export * from './handler';
export * from './method';
