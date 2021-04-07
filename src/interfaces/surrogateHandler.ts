import { NextHandler } from './handlerOptions';

/**
 * @description Surrogate handler types
 */
export type SurrogateHandler<T extends object> = (nextHandler?: NextHandler<T>) => unknown;
