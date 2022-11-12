import type { ShouldHandleTimeTracking } from './interfaces';
import type { TimeTracking } from '../../interfaces';
import { BrowserTimeTracker } from '../../trackers';
import { isFunction } from '../../../helpers';

export class BrowserRule implements ShouldHandleTimeTracking {
  shouldHandle(): boolean {
    return typeof window !== 'undefined' && isFunction(window?.performance?.now);
  }

  run(): TimeTracking {
    return new BrowserTimeTracker();
  }
}
