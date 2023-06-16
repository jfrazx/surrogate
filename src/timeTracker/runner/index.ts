import type { ShouldHandleTimeTracking, TimeTrackingRule } from './rules/interfaces';
import type { TimeTracking } from '../interfaces';
import { rules } from './rules';

export abstract class TimeTrackable {
  static fetch(): TimeTracking {
    const rule: ShouldHandleTimeTracking = rules
      .map((Rule: TimeTrackingRule) => new Rule())
      .find((rule: ShouldHandleTimeTracking) =>
        rule.shouldHandle(),
      ) as ShouldHandleTimeTracking;

    return rule.run();
  }
}
