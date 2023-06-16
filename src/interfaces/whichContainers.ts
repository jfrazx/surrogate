import type { SurrogateHandlerContainer } from '../containers';
import type { HookType } from '../which';

/**
 * @description Object containing PRE and POST handlers for a method
 *
 * @export
 * @interface WhichContainers
 * @template T
 */
export interface WhichContainers<T extends object> {
  [HookType.PRE]: SurrogateHandlerContainer<T>[];
  [HookType.POST]: SurrogateHandlerContainer<T>[];
}
