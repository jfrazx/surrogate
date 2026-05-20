import { SurrogateDelegate, SurrogatePre } from '../src';
import { expect } from 'chai';

describe('Class-level decorator metadata interop', () => {
  describe('getPrototypeOf trap', () => {
    it('should expose the original class as the prototype of the wrapped class', () => {
      class Original {}
      const Wrapped = SurrogateDelegate()(Original);

      expect(Object.getPrototypeOf(Wrapped)).to.equal(Original);
    });

    it('should still terminate the prototype chain at Function.prototype', () => {
      class Original {}
      const Wrapped = SurrogateDelegate()(Original);

      let cursor: object | null = Wrapped;
      const chain: object[] = [];
      while (cursor !== null) {
        chain.push(cursor);
        cursor = Object.getPrototypeOf(cursor);
      }

      expect(chain).to.include(Original);
      expect(chain).to.include(Function.prototype);
    });

    it('should not violate the Proxy invariant when the target is non-extensible', () => {
      // Per ECMAScript §10.5.1, a Proxy's getPrototypeOf result must equal
      // Reflect.getPrototypeOf(target) when target is non-extensible, or the
      // engine throws TypeError on prototype reads. The trap must fall back
      // safely rather than crash.
      class Original {}
      Object.preventExtensions(Original);

      const Wrapped = SurrogateDelegate()(Original);

      expect(() => Object.getPrototypeOf(Wrapped)).to.not.throw();
      expect(Object.getPrototypeOf(Wrapped)).to.equal(Reflect.getPrototypeOf(Original));
    });
  });

  describe('reflect-metadata style lookups', () => {
    // Mini implementation that mirrors how reflect-metadata stores metadata
    // (WeakMap keyed by class identity) and resolves it (walks the prototype
    // chain via Object.getPrototypeOf).
    const store = new WeakMap<object, Map<string, unknown>>();

    const defineMetadata = (key: string, value: unknown, target: object) => {
      const own = store.get(target) ?? new Map<string, unknown>();
      own.set(key, value);
      store.set(target, own);
    };

    const getMetadata = (key: string, target: object): unknown => {
      let cursor: object | null = target;
      while (cursor !== null) {
        const own = store.get(cursor);
        if (own?.has(key)) return own.get(key);
        cursor = Object.getPrototypeOf(cursor);
      }
      return undefined;
    };

    const Tag = (value: string) => (target: object) => defineMetadata('tag', value, target);

    it('should resolve metadata set by another class decorator before SurrogateDelegate', () => {
      // Decoration order matches the reported NestJS scenario:
      // inner decorator runs first (stores on original class identity);
      // SurrogateDelegate runs last (returns a Proxy bound to the class symbol).
      @SurrogateDelegate()
      @Tag('health')
      class HealthController {}

      expect(getMetadata('tag', HealthController)).to.equal('health');
    });

    it('should resolve metadata across multiple decorators of different kinds', () => {
      const Path = (value: string) => (target: object) => defineMetadata('path', value, target);
      const Version = (value: string) =>
        (target: object) => defineMetadata('version', value, target);

      @SurrogateDelegate()
      @Path('/users')
      @Version('v2')
      class UsersController {}

      expect(getMetadata('path', UsersController)).to.equal('/users');
      expect(getMetadata('version', UsersController)).to.equal('v2');
    });

    it('should still let SurrogateDelegate intercept construction and run hooks', () => {
      const calls: string[] = [];

      @SurrogateDelegate()
      @Tag('with-hooks')
      class Worker {
        @SurrogatePre<Worker>({
          handler: () => calls.push('pre'),
          options: { useNext: false },
        })
        run() {
          calls.push('run');
        }
      }

      // Outer-decorator metadata survives the wrap...
      expect(getMetadata('tag', Worker)).to.equal('with-hooks');

      // ...and surrogate hooks still fire on instances.
      new Worker().run();
      expect(calls).to.deep.equal(['pre', 'run']);
    });
  });
});