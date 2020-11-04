import { SurrogateMethodOptions, SurrogateCallback } from './interfaces';
import { WhichMethod, Which, METHOD } from './which';

export interface IContainer<T extends Object> {
  type: WhichMethod;
  options: SurrogateMethodOptions<T>;
  handler: SurrogateCallback<T> | Function;
}

export abstract class BaseContainer<T extends object> implements IContainer<T> {
  constructor(
    public handler: SurrogateCallback<T> | Function,
    public type: WhichMethod,
    public options: SurrogateMethodOptions<T> = { wrapper: 'none' },
  ) {}
}

export class HandlerContainer<T extends object> extends BaseContainer<T> {
  constructor(
    public handler: SurrogateCallback<T>,
    public type: Which,
    options: SurrogateMethodOptions<T> = {},
  ) {
    super(handler, type, options);
  }
}

export class MethodContainer<T extends object> extends BaseContainer<T> {
  constructor(public handler: Function, public originalArgs: any[]) {
    super(handler, METHOD);
  }
}

export interface ContainerGenerator<T extends Object> {
  value: IContainer<T>;
  done: boolean;
}

export const containerGenerator = function* <T extends object>(
  containers: HandlerContainer<T>[],
  original?: IContainer<T>,
) {
  for (const container of containers) {
    yield container;
  }

  return original;
};
