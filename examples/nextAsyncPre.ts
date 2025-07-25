import {
  NextAsyncPre,
  NextParameters,
  NextPreAndPost,
  SurrogateMethods,
  SurrogateDelegate,
  RunConditionParameters,
  SurrogateAsyncPre,
} from '../src';

interface ServiceBase extends SurrogateMethods<ServiceBase> {}

const telemetry = {
  trackEvent(event: { name: string; properties: { [key: string]: any } }) {
    console.log(event);
  },
};

@SurrogateDelegate()
class ServiceBase {
  protected isInitialized = false;

  @NextAsyncPre<ServiceBase>([
    {
      action: ['find', 'findOne', 'aggregate', 'superDuperFind'],
      options: {
        runConditions(this: ServiceBase, params: RunConditionParameters<ServiceBase>) {
          console.log(`checking run conditions`, this.isInitialized, params);

          return !this.isInitialized;
        },
        useNext: false,
      },
    },
  ])
  protected async init() {
    console.log(`initializing client`);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    this.isInitialized = true;
  }

  @NextPreAndPost<ServiceBase>({
    action: ['find', 'findOne', 'aggregate'],
  })
  protected recordTelemetry({
    originalArgs,
    hookType,
    action,
    next,
  }: NextParameters<ServiceBase>) {
    console.log(`recording telemetry ${hookType} ${action}`);

    telemetry?.trackEvent({
      name: `${action} Query`,
      properties: {
        isEnabled: this.serviceIsEnabled,
        type: hookType,
        time: Date.now(),
        originalArgs,
      },
    });

    next.next();
  }

  get serviceIsEnabled() {
    return Math.random() < 0.51;
  }

  async find(_query?: any) {
    console.log(`finding many :: isInitialized: ${this.isInitialized}`, this.constructor.name);
  }

  async findOne(_id: number) {
    console.log(`finding one :: isInitialized: ${this.isInitialized}`, this.constructor.name);
  }

  async aggregate() {
    console.log(`aggregating :: isInitialized: ${this.isInitialized}`, this.constructor.name);
  }
}

@SurrogateDelegate()
class ExtendedService extends ServiceBase {
  async find(query: any) {
    await super.find(query);
    console.log(`extended finding many :: isInitialized: ${this.isInitialized}`);
  }

  @SurrogateAsyncPre<ExtendedService>({
    handler: 'init',
    options: {
      runConditions(this: ExtendedService, params: RunConditionParameters<ServiceBase>) {
        console.log(`checking run conditions`, this.isInitialized, params);

        return !this.isInitialized;
      },
      useNext: false,
    },
  })
  superDuperFind() {
    console.log('super duper finding');
  }
}

const serviceBase = new ServiceBase();
const extendedService = new ExtendedService();

serviceBase
  .aggregate()
  .then(() => serviceBase.findOne(5))
  .then(() => serviceBase.find({ name: 'Surrogate' }))
  .then(() => extendedService.findOne(10))
  .then(() => extendedService.find({ age: 1 }))
  .then(() => extendedService.aggregate())
  .then(() => serviceBase.find())
  .then(() => extendedService.aggregate())
  .then(() => extendedService.superDuperFind());
