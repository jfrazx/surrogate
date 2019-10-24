import { Context } from '../context';

export type BoundContext<T extends object> = () => Context<T>;
