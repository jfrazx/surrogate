import type { SurrogateHandlerContainer } from '../containers';
import type { PRE, POST } from '../which';

/**
 * @description Object containing PRE and POST handlers for a method
 *
 * @export
 * @interface WhichContainers
 * @template T
 */
export interface WhichContainers<T extends object> {
  [PRE]: SurrogateHandlerContainer<T>[];
  [POST]: SurrogateHandlerContainer<T>[];
}
