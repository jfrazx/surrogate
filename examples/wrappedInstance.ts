import { wrapSurrogate, NextParameters } from '../build';

class Network {
  private enabled: boolean = Boolean(Math.random() > 0.5);
  private connected: boolean = Boolean(Math.random() > 0.5);

  readonly host: string = 'localhost';

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

  preConnectionCheck({ next }: NextParameters<Network>) {
    console.info(
      `Checking connected: (${this.isConnected}) and disabled: (${this.isDisabled}) status`,
    );

    next.next({
      bail: this.isConnected || this.isDisabled,
    });
  }
}

const network = wrapSurrogate(new Network());

network.getSurrogate().registerPreHook('connect', network.preConnectionCheck);

network.connect();
