import { SurrogateMethodOptions, SurrogateCallback } from './interfaces';

export class Container<T extends object = any> {
  constructor(
    public handler: SurrogateCallback<T>,
    public options: SurrogateMethodOptions = { wrapper: 'none' },
  ) {}
}

export interface ContainerGenerator {
  value: Container;
  done: boolean;
}
