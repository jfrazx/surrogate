import { PRE_HOOK, POST_HOOK } from '../lib';

export type Which = typeof PRE_HOOK | typeof POST_HOOK;
