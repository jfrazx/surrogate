export const PRE_HOOK: unique symbol = Symbol('pre');
export const POST_HOOK: unique symbol = Symbol('post');

export type Which = typeof PRE_HOOK | typeof POST_HOOK;
