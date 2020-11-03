export const PRE_HOOK: unique symbol = Symbol('pre');
export const METHOD: unique symbol = Symbol('method');
export const POST_HOOK: unique symbol = Symbol('post');
export const BOTH: unique symbol = Symbol('both');

export type Which = typeof PRE_HOOK | typeof POST_HOOK;
export type WhichMethod = Which | typeof METHOD;
export type Whichever = Which | typeof BOTH;
