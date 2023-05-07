import type { CombinedOptions, GlobalHandlerOptions } from './interfaces';
import { defaultGlobalOptions, defaultMethodOptions } from './lib';

export interface OptionsHandler<T extends object> extends CombinedOptions<T> {}

export class OptionsHandler<T extends object> {
  constructor(protected combinedOptions: GlobalHandlerOptions<T> = {}) {
    const options = this.mergeOptions(combinedOptions);

    Object.entries(options).forEach(([key, value]) => {
      Object.defineProperty(this, key, {
        enumerable: true,
        value,
      });
    });
  }

  private mergeOptions({
    handler = {},
    global = {},
  }: GlobalHandlerOptions<T>): CombinedOptions<T> {
    return { ...defaultMethodOptions, ...defaultGlobalOptions, ...global, ...handler };
  }
}
