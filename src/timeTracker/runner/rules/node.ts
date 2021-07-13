import { ShouldHandleTimeTracking } from './interfaces';
import { NodeTimeTracker } from '../../trackers';
import { TimeTracking } from '../../interfaces';
import { isFunction } from '../../../helpers';

export class NodeRule implements ShouldHandleTimeTracking {
  shouldHandle(): boolean {
    return typeof process !== 'undefined' && isFunction(process.hrtime);
  }

  run(): TimeTracking {
    return new NodeTimeTracker();
  }
}
