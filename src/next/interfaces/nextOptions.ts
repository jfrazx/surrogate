export interface NextOptions extends BailOptions {
  bail?: boolean;
}

export interface BailOptions {
  error?: Error | false;
  bailWith?: any;
  replace?: any;
  using?: any[];
}
