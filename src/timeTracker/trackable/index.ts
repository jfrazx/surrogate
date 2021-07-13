import { TimeTracking } from '../interfaces';

export abstract class Trackable implements TimeTracking {
  protected readonly hookTimes: [number, number][] = [];
  protected nanosecondsInMilliseconds = 1000000;
  protected nanosecondsInSeconds = 1000000000;
  protected hookStartTime: number;

  protected abstract readonly startTime: number;
  protected abstract getNow(): number;

  getStartTime(): number {
    return Date.now() - this.getTotalDuration();
  }

  getHookStartTime() {
    return this.getStartTime() + (this.hookStartTime - this.startTime);
  }

  getLastRunDuration() {
    const [hookStart, hookEnd] = this.lastRun;

    return hookEnd - hookStart;
  }

  getTotalDuration(): number {
    return this.getNow() - this.startTime;
  }

  getDurationSinceLastRun(): number {
    const lastRun = this.lastRunEnd;

    return this.getNow() - lastRun;
  }

  setHookStart() {
    this.hookStartTime = this.getNow();
  }

  setHookEnd() {
    this.hookTimes.push([this.hookStartTime, this.getNow()]);
  }

  get lastRun() {
    const [hookStart, hookEnd] = this.hookTimes[this.hookTimes.length - 1] ?? [];

    return [hookStart ?? this.startTime, hookEnd ?? this.getNow()];
  }

  get lastRunStart(): number {
    const [hookStart] = this.lastRun;

    return hookStart;
  }

  get lastRunEnd(): number {
    const [, hookEnd] = this.lastRun;

    return hookEnd;
  }
}
