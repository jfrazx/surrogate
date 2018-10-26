export class Network {
  private enabled: boolean = true;
  private connected: boolean = false;

  host: string = 'localhost';

  isEnabled(): boolean {
    return this.enabled;
  }

  isDisabled(): boolean {
    return !this.isEnabled();
  }

  isConnected(): boolean {
    return this.connected;
  }

  enable(): void {
    this.enabled = true;
  }

  disable(): void {
    this.enabled = false;
  }

  connect(): void {
    console.log('connecting to somewhere...');

    this.connected = true;
  }

  disconnect(): void {
    console.log('disconnecting from somewhere...');

    this.connected = false;
  }
}
