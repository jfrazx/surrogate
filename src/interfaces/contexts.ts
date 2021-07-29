export type SurrogateContexts = 'instance' | 'surrogate';
export type MethodWrappers = 'sync' | 'async';

export type Contexts = SurrogateContexts | typeof Object | typeof Function | Object;

export enum SurrogateContext {
  Instance = 'instance',
  Surrogate = 'surrogate',
}

export enum MethodWrapper {
  Sync = 'sync',
  Async = 'async',
}

export enum HookType {
  PRE = 'pre',
  POST = 'post',
  BOTH = 'both',
}
