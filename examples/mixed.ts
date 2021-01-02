import { SurrogateDelegate, INext, SurrogateMethods, SurrogateUnwrapped } from '../build';

interface INetwork {
  isEnabled: boolean;
  isDisabled: boolean;
  isConnected: boolean;
  preConnectionCheck(next: INext<Network>): void;
}

interface Network extends SurrogateMethods<Network> {}

@SurrogateDelegate({ useSingleton: true })
class Network implements INetwork {
  private enabled: boolean = Boolean(Math.random() > 0.5);
  private connected: boolean = Boolean(Math.random() > 0.5);

  readonly host: string = 'localhost';

  init() {
    this.getSurrogate()
      .registerPreHook('connect', this.preConnectionCheck)
      .registerPreHook('disconnect', (next: INext<Network>) => next.next({ bail: true }), {
        runConditions: (network: SurrogateUnwrapped<Network>) => {
          console.log(
            `Checking network is connected before attempting to disconnect: ${network.isConnected}`,
          );

          return network.isConnected === false;
        },
      });
  }

  get isEnabled(): boolean {
    return this.enabled;
  }

  get isDisabled(): boolean {
    return !this.isEnabled;
  }

  get isConnected(): boolean {
    return this.connected;
  }

  enable(): void {
    this.enabled = true;
  }

  disable(): void {
    this.enabled = false;
  }

  connect() {
    console.log('connecting to somewhere...');

    this.connected = true;
  }

  disconnect(): void {
    console.log('disconnecting from somewhere...');

    this.connected = false;
  }

  preConnectionCheck(next: INext<Network>) {
    console.info(
      `Checking connected: (${this.isConnected}) and disabled: (${this.isDisabled}) status`,
    );

    next.next({
      bail: this.isConnected || this.isDisabled,
    });
  }
}

const network = new Network();

network.init();
network.connect();
network.disconnect();
