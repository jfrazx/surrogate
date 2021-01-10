import { HandlerContainer } from '../containers';
import { PRE, POST } from '../which';

/**
 * @description Object containing PRE and POST handlers for a method
 *
 * @export
 * @interface WhichContainers
 * @template T
 */
export interface WhichContainers<T extends object> {
  [PRE]: HandlerContainer<T>[];
  [POST]: HandlerContainer<T>[];
}
