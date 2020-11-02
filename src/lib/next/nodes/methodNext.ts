import { NextOptions } from '../interfaces';
import { FinalNext } from './finalNext';

export class MethodNext<T extends object> extends FinalNext<T> {
  next(options: NextOptions = {}) {
    console.info('options', options);
  }
}
