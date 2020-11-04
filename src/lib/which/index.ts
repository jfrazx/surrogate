export const POST_HOOK: unique symbol = Symbol('post');
export const METHOD: unique symbol = Symbol('method');
export const PRE_HOOK: unique symbol = Symbol('pre');
export const EMPTY: unique symbol = Symbol('empty');
export const BOTH: unique symbol = Symbol('both');

export type WhichMethod = Which | typeof METHOD | typeof EMPTY;
export type Which = typeof PRE_HOOK | typeof POST_HOOK;
export type Whichever = Which | typeof BOTH;
