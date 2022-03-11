import fastRedact from 'fast-redact';
import * as sinon from 'sinon';
import {
  NextPre,
  SurrogatePre,
  SurrogatePost,
  NextParameters,
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

  trackException(event: any) {
    this.getClient()?.trackException(event);
  }

  @SurrogatePre<Telemetry>({
    handler: ({ next }) => next.next({ bail: true }),
    options: { runConditions: bootstrapRunCondition },
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

  @NextPre<Telemetry>({
    action: ['track*'],
    options: { ignoreErrors: true },
  })
  @SurrogatePost<Telemetry>({
    handler({ originalArgs, currentArgs, next }) {
      const [{ exception }] = originalArgs;
      const [telemetry] = currentArgs;

      next.next({ replace: { ...telemetry, exception } });
    },
    options: {
      ignoreErrors: true,
      runConditions: ({ action }) => action === 'trackException',
    },
  })
  protected redact({ originalArgs, next }: NextParameters<Telemetry>) {
    const [telemetry] = originalArgs;
    const redacted = redact(telemetry);

    next.next({ replace: redacted });
  }
}

const redactableKeys = [
  'token',
  'secret',
  'password',
  'client_secret',
  'encryptionPassword',
  'credentials.password',
  'encryptionPrivateKey',
  'socialSecurityNumber',
  'social_security_number',
  'sftpCredentials.password',
];

const paths = redactableKeys.flatMap((key) => [key, `*.${key}`, `properties.*.${key}`]);

const redaction = fastRedact({ paths });

const redact = <T>(value: T): T => JSON.parse(redaction(value) as string);
