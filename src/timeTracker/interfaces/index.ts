export interface TimeTracking extends TimeTracker {
  setHookStart(): void;
  setHookEnd(): void;
}

export interface TimeTracker {
  getDurationSinceLastRun(): number;
  getLastRunDuration(): number;
  getHookStartTime(): number;
  getTotalDuration(): number;
  getStartTime(): number;
}
