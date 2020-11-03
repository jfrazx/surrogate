export const isFunction = (value: any): value is Function => isType(value, 'function');

export const isObject = (value: any): value is object => isType(value, 'object');

const isType = (value: any, type: string): boolean => typeof value === type;

export const isAsync = (func: any): boolean => {
  return func[Symbol.toStringTag] === 'AsyncFunction';
};

export const isPromiseLike = (value: any): value is Promise<any> => {
  return value instanceof Promise || isFunction(value?.then);
};
