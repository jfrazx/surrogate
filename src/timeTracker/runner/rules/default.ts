import { ShouldHandleTimeTracking } from './interfaces';
import { DefaultTimeTracker } from '../../trackers';
import { TimeTracking } from '../../interfaces';

export class DefaultRule implements ShouldHandleTimeTracking {
  shouldHandle(): boolean {
    return true;
  }

  run(): TimeTracking {
    return new DefaultTimeTracker();
  }
}
