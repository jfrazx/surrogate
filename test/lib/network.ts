import { NextParameters } from '../../src';

export class Network {
  private enabled: boolean = true;
  private connected: boolean = false;

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

  async asyncConnect() {
    console.log('connecting to somewhere...');

    this.connected = true;
  }

  async asyncError() {
    throw new Error('async error');
  }

  checkServer(name: string) {
    return name;
  }

  async checkServerAsync(name: string) {
    return name;
  }

  disconnect(): void {
    console.log('disconnecting from somewhere...');

    this.connected = false;
  }

  preConnectHandler({ next }: NextParameters<this>) {
    next.next({
      bail: this.isConnected || this.isDisabled,
    });
  }
}
