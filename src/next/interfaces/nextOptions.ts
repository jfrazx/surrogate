export interface NextOptions extends BailOptions {
  bail?: boolean;
}

export interface BailOptions {
  error?: Error | false | null | undefined;
  bailWith?: any;
  replace?: any;
  using?: any[];
}
