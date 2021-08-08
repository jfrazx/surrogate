import * as sinon from 'sinon';
import {
  NextPre,
  SurrogatePre,
  SurrogateMethods,
  SurrogateContext,
  SurrogateDelegate,
} from '../../src';

export interface Telemetry extends SurrogateMethods<Telemetry> {}

export const getClientRunCondition = sinon.spy(({ instance: telemetry }) => {
  console.log(`get client run condition`);
  return !telemetry.telemetryStarted();
});
export const bootstrapRunCondition = sinon.spy(({ instance: telemetry }) => {
  console.log(`bootstrap run condition`);
  return telemetry.telemetryStarted();
});

@SurrogateDelegate({ useContext: SurrogateContext.Surrogate })
export class Telemetry {
  private isInitialized = false;

  getClient(): any {
    console.log(`get client`);
  }

  trackEvent(event: any) {
    this.getClient()?.trackEvent(event);
  }

  @SurrogatePre<Telemetry>({
    handler: ({ next }) => next.next({ bail: true }),
    options: {
      runConditions: bootstrapRunCondition,
    },
  })
  @NextPre<Telemetry>({
    action: 'getClient',
    options: {
      noArgs: true,
      useNext: false,
      runConditions: getClientRunCondition,
    },
  })
  bootstrap() {
    console.log(`bootstrap`);
    this.isInitialized = true;
  }

  telemetryStarted() {
    return this.isInitialized;
  }
}
