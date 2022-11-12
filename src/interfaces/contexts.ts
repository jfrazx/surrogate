export type SurrogateContexts = 'instance' | 'surrogate';
export type MethodWrappers = 'sync' | 'async';

export type Contexts = SurrogateContexts | typeof Object | typeof Function | Object;

/**
 * @description Function run when an Error occurs and will determine if Surrogate should silence any error output
 */
export type ShouldSilence = (error: Error) => boolean;
