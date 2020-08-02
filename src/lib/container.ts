import { SurrogateMethodOptions } from '../interfaces';
import { SurrogateCallback } from '../types';

export class Container<T extends object = any> {
  constructor(
    public callback: SurrogateCallback<T>,
    public options: SurrogateMethodOptions = { wrapper: 'none' },
  ) {}
}
