import { ShouldHandleTimeTracking } from './interfaces';
import { BrowserTimeTracker } from '../../trackers';
import { TimeTracking } from '../../interfaces';
import { isFunction } from '../../../helpers';

export class BrowserRule implements ShouldHandleTimeTracking {
  shouldHandle(): boolean {
    return typeof window !== 'undefined' && isFunction(window.performance?.now);
  }

  run(): TimeTracking {
    return new BrowserTimeTracker();
  }
}
