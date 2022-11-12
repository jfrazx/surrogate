import type { ShouldHandleTimeTracking } from './interfaces';
import type { TimeTracking } from '../../interfaces';
import { NodeTimeTracker } from '../../trackers';
import { isFunction } from '../../../helpers';

export class NodeRule implements ShouldHandleTimeTracking {
  shouldHandle(): boolean {
    return typeof process !== 'undefined' && isFunction(process?.hrtime);
  }

  run(): TimeTracking {
    return new NodeTimeTracker();
  }
}
