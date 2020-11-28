import { wrapSurrogate, INext, GetSurrogate } from '../build';

interface INetwork {
  isEnabled: boolean;
  isDisabled: boolean;
  isConnected: boolean;
  preConnectHandler(next: INext<Network>): void;
}

interface Network extends GetSurrogate<Network> {}

class Network implements INetwork {
  private enabled: boolean = true;
  private connected: boolean = false;

  readonly host: string = 'localhost';

  constructor() {
    this.getSurrogate().registerPreHook('connect', this.preConnectHandler);
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

  preConnectHandler(next: INext<Network>) {
    next.next({
      bail: this.isConnected || this.isDisabled,
    });
  }
}

const network = wrapSurrogate(new Network());

network.connect();