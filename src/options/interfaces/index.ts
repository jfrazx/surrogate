import type { SurrogateOptions, SurrogateHandlerOptions } from '../../interfaces';

export interface GlobalHandlerOptions<T extends object> {
  handler?: SurrogateHandlerOptions<T>;
  global?: SurrogateOptions;
}

export type CombinedOptions<T extends object> = Required<SurrogateHandlerOptions<T>> &
  Required<Omit<SurrogateOptions, 'useSingleton'>>;
