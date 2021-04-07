import {
  BOTH,
  NextFor,
  NextHandler,
  NextAsyncPre,
  SurrogateMethods,
  SurrogateDelegate,
} from '../build';

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
      action: ['find', 'findOne', 'aggregate'],
      options: {
        runConditions: function (this: ServiceBase) {
          console.log(`checking run conditions`, this);
          return !this.isInitialized;
        },
        resetContext: Math.random() > 0.5,
        useNext: false,
      },
    },
  ])
  protected async init() {
    console.log(`initializing client`);
    this.isInitialized = true;
  }

  @NextFor<ServiceBase>({
    type: BOTH,
    action: ['find', 'findOne', 'aggregate'],
  })
  protected recordTelemetry({
    originalArgs,
    hookType,
    action,
    next,
  }: NextHandler<ServiceBase>) {
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
  .then(() => extendedService.aggregate());
