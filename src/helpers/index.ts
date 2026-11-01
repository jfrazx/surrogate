export const isNull = (value: unknown): value is null => value === null;
export const isBool = (value: unknown): value is boolean => isType(value, 'boolean');
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

export const createCorrelationId = (): string => {
  const { crypto } = globalThis;

  if (isFunction(crypto.randomUUID)) {
    return crypto.randomUUID();
  }

  // Browsers only expose randomUUID in secure contexts; getRandomValues is always available
  const bytes = crypto.getRandomValues(new Uint8Array(16));

  bytes[6] = (bytes[6]! & 0x0f) | 0x40;
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;

  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');

  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20),
  ].join('-');
};
