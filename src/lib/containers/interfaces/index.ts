import { SurrogateMethodOptions, SurrogateHandler } from '../../interfaces';
import { WhichMethod } from '../../which';

export interface IContainer<T extends object> {
  type: WhichMethod;
  options: SurrogateMethodOptions<T>;
  handler: SurrogateHandler<T> | Function;
}

export interface ContainerGenerator<T extends object> {
  value: IContainer<T>;
  done: boolean;
}
