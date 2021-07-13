import { Trackable } from '../trackable';

export class NodeTimeTracker extends Trackable {
  protected readonly startTime = this.getNow();

  protected getNow(): number {
    const [seconds, nanoseconds] = process.hrtime();

    return (
      (seconds * this.nanosecondsInSeconds + nanoseconds) / this.nanosecondsInMilliseconds
    );
  }
}
