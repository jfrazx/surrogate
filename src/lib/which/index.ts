export const METHOD: unique symbol = Symbol('method');
export const EMPTY: unique symbol = Symbol('empty');
export const BOTH: unique symbol = Symbol('both');
export const POST: unique symbol = Symbol('post');
export const PRE: unique symbol = Symbol('pre');

export type WhichMethod = Which | typeof METHOD | typeof EMPTY;
export type Which = typeof PRE | typeof POST;
export type Whichever = Which | typeof BOTH;
