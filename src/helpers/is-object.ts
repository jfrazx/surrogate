import { isType } from './is-type';

export function isObject(value: any): value is object {
  return isType(value, 'object');
}
