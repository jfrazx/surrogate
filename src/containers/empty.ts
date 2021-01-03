import { BaseContainer } from './base';
import { EMPTY } from '../which';

export class EmptyContainer<T extends object> extends BaseContainer<T> {
  constructor() {
    super(() => {}, EMPTY);
  }
}
