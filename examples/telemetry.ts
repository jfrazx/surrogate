import * as appInsights from 'applicationinsights';
import fastRedact from 'fast-redact';
import {
  NextPre,
  SurrogatePre,
  SurrogatePost,
  NextParameters,
  SurrogateContext,
  SurrogateMethods,
  SurrogateDelegate,
} from '../build';

const configuration = {
  instrumentationKey: '1aa11111-bbbb-1ccc-8ddd-eeeeffff3333',
  debugKey: '1aa11111-bbbb-1ccc-8ddd-eeeeffff3333',
  debug: Math.random() >= 0.49,
  liveMetrics: false,
  appInstance: 'App Instance',
  name: 'TelemetryExample',
  sampleRate: 100,
  batchSize: 200,
};
const NANOSECONDS_IN_SECONDS = 1000000000;
const NANOSECONDS_IN_MILLISECONDS = 1000000;

@SurrogateDelegate<Telemetry>({ useContext: SurrogateContext.Surrogate })
export class Telemetry {
  readonly dateTimeFormat = 'YYYY-MM-DD HH:mm:ss';
  readonly instance = appInsights;

  private isInitialized = false;

  constructor(private readonly config = configuration) {}

  trackDependency(telemetry: appInsights.Contracts.DependencyTelemetry) {
    this.getClient().trackDependency(telemetry);
  }

  trackEvent(telemetry: appInsights.Contracts.EventTelemetry) {
    this.getClient().trackEvent(telemetry);
  }

  trackException(telemetry: appInsights.Contracts.ExceptionTelemetry) {
    this.getClient().trackException(telemetry);
  }

  trackMetric(telemetry: appInsights.Contracts.MetricTelemetry) {
    this.getClient().trackMetric(telemetry);
  }

  trackTrace(telemetry: appInsights.Contracts.TraceTelemetry) {
    this.getClient().trackTrace(telemetry);
  }

  startTimeTracking() {
    const start = process.hrtime();

    const endTimeTrackingMs = () => {
      const [seconds, nanoSeconds] = process.hrtime(start);

      return (seconds * NANOSECONDS_IN_SECONDS + nanoSeconds) / NANOSECONDS_IN_MILLISECONDS;
    };

    return endTimeTrackingMs;
  }

  getClient() {
    return appInsights.defaultClient;
  }

  @SurrogatePre<Telemetry>({
    handler: ({ next }) => next.next({ bail: true }),
    options: {
      runConditions: ({ instance: telemetry }) => telemetry.telemetryStarted(),
    },
  })
  @NextPre<Telemetry>({
    action: ['getClient'],
    options: {
      noArgs: true,
      useNext: false,
      useContext: SurrogateContext.Instance,
      runConditions: ({ instance: telemetry }) => !telemetry.telemetryStarted(),
    },
  })
  bootstrap(processName = 'ExampleApp') {
    if (this.appInsightsKeyExists() === false) {
      console.error(
        'AppInsights key is missing from APP_INSIGHTS_INSTRUMENTATION_KEY. Telemetry disabled.',
      );
    }

    const serviceName = processName || this.config.name || 'ExampleApp';

    appInsights
      .setup(this.config.instrumentationKey)
      .setAutoDependencyCorrelation(true)
      .setAutoCollectRequests(true)
      .setAutoCollectPerformance(true, true)
      .setAutoCollectExceptions(true)
      .setAutoCollectDependencies(true)
      .setAutoCollectConsole(true, true)
      .setUseDiskRetryCaching(true)
      .setSendLiveMetrics(this.config.liveMetrics)
      .setDistributedTracingMode(appInsights.DistributedTracingModes.AI);

    const cRoleKey = appInsights.defaultClient.context.keys.cloudRole;

    appInsights.defaultClient.context.tags[cRoleKey] = serviceName;
    appInsights.defaultClient.config.samplingPercentage = this.getSamplingRate();
    appInsights.defaultClient.config.maxBatchSize = this.getBatchSize();
    appInsights.defaultClient.commonProperties = {
      instance: this.config.appInstance,
      pid: String(process.pid),
    };

    appInsights.start();

    this.isInitialized = true;
  }

  telemetryStarted() {
    return this.isInitialized && appInsights.defaultClient !== null;
  }

  @NextPre<Telemetry>({
    action: ['track*'],
    options: {
      runConditions(this: Telemetry) {
        return this.config.debug;
      },
      useNext: false,
    },
  })
  protected debug({ originalArgs }: NextParameters<Telemetry>) {
    console.log(...originalArgs);
  }

  appInsightsKeyExists() {
    const UUID_Regex = '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
    const regexp = new RegExp(UUID_Regex);

    return this.config.instrumentationKey === this.config.debugKey
      ? false
      : regexp.test(this.config.instrumentationKey);
  }

  getSamplingRate() {
    const { sampleRate } = this.config;

    return Number.isNaN(sampleRate) || sampleRate < 0 || sampleRate > 100 ? 100 : sampleRate;
  }

  getBatchSize() {
    const { batchSize } = this.config;

    return Number.isNaN(batchSize) || batchSize < 1 ? 200 : batchSize;
  }

  @NextPre<Telemetry>({
    action: ['track*'],
    options: {
      ignoreErrors: true,
      useContext: SurrogateContext.Surrogate,
    },
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

console.log(`Telemetry debugging is disabled: ${configuration.debug === false}`);

const telemetry = new Telemetry();

export interface Telemetry extends SurrogateMethods<Telemetry> {}

Object.entries(telemetry.getSurrogate().getEventMap()).forEach(([event, whichContainers]) => {
  console.log(`Containers for ${event}`);
  console.log(whichContainers);
});

telemetry.trackEvent({
  name: 'TestingTrackEvent',
  properties: {
    data: 'Some Content',
  },
});

telemetry.trackException({
  exception: new Error(`Failure`),
  properties: {
    relevantData: 'relevant data',
  },
});

process.exit();
