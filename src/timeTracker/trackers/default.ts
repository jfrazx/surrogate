import { Trackable } from '../trackable';

export class DefaultTimeTracker extends Trackable {
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
