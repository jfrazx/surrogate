import { SurrogateMethodOptions } from '../interfaces';
import { SurrogateCallback } from '../types';

export class Container {
  constructor(
    public callback: SurrogateCallback,
    public options: SurrogateMethodOptions = { wrapper: 'none' },
  ) {}
}
