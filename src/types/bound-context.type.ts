import { Context } from '../lib';

export type BoundContext<T extends object> = () => Context<T>;
