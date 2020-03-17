import { WhichContainers } from './which-containers.interface';

/**
 * Describes object holding events and their handlers
 *
 * @interface EventMap
 */
export interface EventMap {
  [event: string]: WhichContainers;
}
