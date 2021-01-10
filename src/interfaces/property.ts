export type Property = string | number;

export type PropertyDecorator<T extends object> = (
  target: T,
  property: string,
  descriptor: PropertyDescriptor,
) => void;
