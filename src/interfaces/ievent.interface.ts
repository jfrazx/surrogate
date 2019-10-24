import { Container } from '../container';

/**
 * Describes object holding events and their handlers
 *
 * @interface IEvent
 */
export interface IEvent {
  [event: string]: {
    [which: string]: Container[];
  };
}
