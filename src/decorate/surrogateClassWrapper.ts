import { Constructor } from './constructor.type';
import { SurrogateOptions } from '../interfaces';
import { SurrogateProxy } from '../lib';

export class SurrogateClassWrapper<T extends object> implements ProxyHandler<T> {
  constructor(private options: SurrogateOptions = {}) {}

  construct(Target: T, args: any[], newTarget: T) {
    console.log(Target, args, newTarget);
    const instance = new (Target as Constructor<T>)(...args);

    return SurrogateProxy.wrap(instance, this.options);
  }

  static wrap<T extends object>(klass: T, options: SurrogateOptions = {}): T {
    return new Proxy(klass, new SurrogateClassWrapper(options));
  }
}
