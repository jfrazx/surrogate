import type { ShouldHandle } from '../../../../interfaces';
import type { TimeTracking } from '../../../interfaces';

export interface ShouldHandleTimeTracking extends ShouldHandle {
  run(): TimeTracking;
}

export interface TimeTrackingRule {
  new (): ShouldHandleTimeTracking;
}
