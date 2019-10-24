import { isType } from './is-type';

export function isFunction(value: any): value is Function {
  return isType(value, 'function');
}
