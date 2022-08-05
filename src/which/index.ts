export const METHOD = 'method';
export const EMPTY = 'empty';
export const BOTH = 'both';
export const POST = 'post';
export const PRE = 'pre';

export type WhichMethod = Which | typeof METHOD | typeof EMPTY;
export type Which = typeof PRE | typeof POST;
export type Whichever = Which | typeof BOTH;

export enum HookType {
  PRE = 'pre',
  POST = 'post',
  BOTH = 'both',
}
