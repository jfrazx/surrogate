import { Trackable } from '../trackable';

export class BrowserTimeTracker extends Trackable {
  protected startTime: number = this.getNow();

  protected getNow(): number {
    return window.performance.now();
  }
}
