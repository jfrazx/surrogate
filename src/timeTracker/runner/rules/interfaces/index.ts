import { ShouldHandle } from '../../../../interfaces';
import { TimeTracking } from '../../../interfaces';

export interface ShouldHandleTimeTracking extends ShouldHandle {
  run(): TimeTracking;
}

export interface TimeTrackingRule {
  new (): ShouldHandleTimeTracking;
}
