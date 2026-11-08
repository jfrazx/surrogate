import type { CombinedOptions, GlobalHandlerOptions } from './interfaces';
import { defaultGlobalOptions, defaultMethodOptions } from './lib';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- declares the option properties the constructor defines at runtime
export interface OptionsHandler<T extends object> extends CombinedOptions<T> {}

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging -- the merged interface types the properties defined in the constructor
export class OptionsHandler<T extends object> {
  constructor(protected readonly combinedOptions: GlobalHandlerOptions<T> = {}) {
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
