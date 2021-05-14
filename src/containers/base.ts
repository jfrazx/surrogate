import { SurrogateHandler } from '../interfaces';
import { OptionsHandler } from '../options';
import { IContainer } from './interfaces';
import { WhichMethod } from '../which';

export abstract class BaseContainer<T extends object> implements IContainer<T> {
  constructor(
    public handler: SurrogateHandler<T> | Function,
    public type: WhichMethod,
    public options: OptionsHandler<T> = new OptionsHandler(),
  ) {}
}
