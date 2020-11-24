import { HandlerContainer } from '../containers';
import { PRE, POST } from '../which';

export interface WhichContainers<T extends object> {
  [PRE]: HandlerContainer<T>[];
  [POST]: HandlerContainer<T>[];
}
