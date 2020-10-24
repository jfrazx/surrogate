import { Hooks } from '../interfaces';

/**
 * Type returned from wrapper or SurrogateProxy.wrap
 */
export type Surrogate<T extends object> = Hooks<T> & T;
