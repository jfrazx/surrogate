import type { ShouldHandleTimeTracking } from './interfaces';
import { FallbackTimeTracker } from '../../trackers';
import type { TimeTracking } from '../../interfaces';

export class FallbackRule implements ShouldHandleTimeTracking {
  shouldHandle(): boolean {
    return true;
  }

  run(): TimeTracking {
    return new FallbackTimeTracker();
  }
}
