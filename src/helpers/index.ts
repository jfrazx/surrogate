export const isNotUndefined = (value: unknown) => !isUndefined(value);
export const isNull = (value: unknown): value is null => value === null;
export const isBool = (value: unknown): value is boolean => isType(value, 'boolean');
export const isString = (value: unknown): value is string => isType(value, 'string');
export const isFunction = (value: unknown): value is Function => isType(value, 'function');
export const isUndefined = (value: unknown): value is undefined => isType(value, 'undefined');
export const isObject = (value: unknown): value is object =>
  isType(value, 'object') && !isNull(value) && !Array.isArray(value);

const isType = (value: unknown, type: string): boolean => typeof value === type;

export const isAsync = (func: any): boolean => {
  return func[Symbol.toStringTag] === 'AsyncFunction';
};

export const isPromiseLike = (value: any): value is Promise<any> => {
  return value instanceof Promise || isFunction(value?.then);
};
