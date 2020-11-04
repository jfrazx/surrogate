import { HandlerContainer } from '../containers';
import { PRE_HOOK, POST_HOOK } from '../which';

export interface WhichContainers<T extends Object> {
  [PRE_HOOK]: HandlerContainer<T>[];
  [POST_HOOK]: HandlerContainer<T>[];
}
