import { TimeTracking } from '../interfaces';
import { rules } from './rules';

export abstract class TimeTrackable {
  static fetch(): TimeTracking {
    return rules
      .map((Rule) => new Rule())
      .find((rule) => rule.shouldHandle())
      .run();
  }
}
