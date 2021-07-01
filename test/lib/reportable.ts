import { SurrogateDelegate, SurrogateMethods, NextHandler, NextPre } from '../../src';
import * as sinon from 'sinon';

export const logReporter = sinon.spy(function logReporter(
  this: BugReport,
  { action, hookType }: NextHandler<BugReport>,
) {
  console.log({
    action,
    hookType,
    title: this.title,
    reportType: this.type,
  });
});

export interface BugReport extends SurrogateMethods<BugReport> {
  reportingURL: string;
}

function Reportable<T extends { new (...args: any[]): {} }>(constructor: T) {
  return class extends constructor {
    reportingURL = 'http://www.example.com';
  };
}

@SurrogateDelegate({
  locateWith: BugReport,
})
@Reportable
export class BugReport {
  type = 'report';

  constructor(public title: string) {}

  report() {
    console.log(`${this.type} to ${this.reportingURL}`);
  }

  @NextPre<BugReport>({
    action: 'report',
    options: {
      useNext: false,
    },
  })
  logReporter(next: NextHandler<BugReport>) {
    logReporter.call(this, next);
  }
}
