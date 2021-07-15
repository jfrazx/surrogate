import { Trackable } from '../trackable';

export class FallbackTimeTracker extends Trackable {
  protected startTime: number = this.getNow();

  getStartTime(): number {
    return this.startTime;
  }

  getHookStartTime() {
    return this.hookStartTime;
  }

  protected getNow(): number {
    return Date.now();
  }
}
