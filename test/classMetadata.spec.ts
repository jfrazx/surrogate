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
    const Path = (value: string) => (target: object) => defineMetadata('path', value, target);

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

    describe('resolving from an instance', () => {
      // NestJS (guards, interceptors, Reflector) resolves class metadata from
      // instance.constructor rather than from the exported class symbol.
      it('should resolve metadata set by a class decorator after SurrogateDelegate', () => {
        @Tag('skip-throttle')
        @SurrogateDelegate({ reportWrapperAsConstructor: true })
        class HealthController {}

        expect(getMetadata('tag', new HealthController().constructor)).to.equal(
          'skip-throttle',
        );
      });

      it('should resolve inner and outer metadata from the same instance', () => {
        @Tag('skip-throttle')
        @SurrogateDelegate({ reportWrapperAsConstructor: true })
        @Path('/health')
        class HealthController {}

        const Klass = new HealthController().constructor;

        expect(getMetadata('tag', Klass)).to.equal('skip-throttle');
        expect(getMetadata('path', Klass)).to.equal('/health');
      });
    });
  });

  describe('instance constructor', () => {
    const reportWrapper = { reportWrapperAsConstructor: true };

    it('should report the original class by default', () => {
      // class-validator and class-transformer key metadata by the original
      // class and resolve it from instance.constructor.
      class Original {}
      const Wrapped = SurrogateDelegate()(Original);

      expect(new Wrapped().constructor).to.equal(Original);
    });

    it('should build a wrapped instance with hooks through instance.constructor', () => {
      const calls: string[] = [];

      @SurrogateDelegate(reportWrapper)
      class Worker {
        @SurrogatePre<Worker>({
          handler: () => calls.push('pre'),
          options: { useNext: false },
        })
        run() {
          calls.push('run');
        }
      }

      const Rebuilt = new Worker().constructor as typeof Worker;
      new Rebuilt().run();

      expect(calls).to.deep.equal(['pre', 'run']);
    });

    it('should let subclasses keep their own constructor', () => {
      @SurrogateDelegate(reportWrapper)
      class Base {}
      class Child extends Base {}

      expect(new Child().constructor).to.equal(Child);
    });

    it('should report the wrapper when the prototype is frozen', () => {
      class Original {}
      Object.freeze(Original.prototype);

      const Wrapped = SurrogateDelegate(reportWrapper)(Original);

      expect(new Wrapped().constructor).to.equal(Wrapped);
    });

    it('should leave instances of the original class unchanged', () => {
      class Original {}
      SurrogateDelegate(reportWrapper)(Original);

      expect(new Original().constructor).to.equal(Original);
    });

    it('should report each wrapper when a class is wrapped more than once', () => {
      class Original {}
      const First = SurrogateDelegate(reportWrapper)(Original);
      const Second = SurrogateDelegate(reportWrapper)(Original);

      expect(new First().constructor).to.equal(First);
      expect(new Second().constructor).to.equal(Second);
    });

    it('should report the outer wrapper when only it opts in', () => {
      class Original {}
      const Wrapped = SurrogateDelegate(reportWrapper)(SurrogateDelegate()(Original));

      expect(new Wrapped().constructor).to.equal(Wrapped);
    });

    it('should report the outermost wrapper when an inner wrapper opts in', () => {
      // Metadata on the outermost wrapper reaches the inner layers through the
      // getPrototypeOf trap, so it is the most complete class to report.
      class Original {}
      const Wrapped = SurrogateDelegate()(SurrogateDelegate(reportWrapper)(Original));

      expect(new Wrapped().constructor).to.equal(Wrapped);
    });

    it('should report the wrapper of a subclass whose base class is wrapped', () => {
      @SurrogateDelegate()
      class Base {}

      @SurrogateDelegate(reportWrapper)
      class Child extends Base {}

      expect(new Child().constructor).to.equal(Child);
    });

    it('should keep ancestry walks through prototype.constructor finite', () => {
      // class-transformer collects inherited metadata with this walk.
      class Base {}
      class Original extends Base {}
      const Wrapped = SurrogateDelegate(reportWrapper)(Original);
      const ancestors: Function[] = [];

      for (
        let klass = Object.getPrototypeOf(Wrapped.prototype.constructor);
        klass.prototype !== undefined && ancestors.length < 5;
        klass = Object.getPrototypeOf(klass.prototype.constructor)
      ) {
        ancestors.push(klass);
      }

      expect(ancestors).to.deep.equal([Base]);
    });

    it('should run hooks from a method decorator applied after SurrogateDelegate', () => {
      // Method decorators store hooks under target.constructor. The wrapper's
      // prototype is the original's, so that is still the original class.
      const calls: string[] = [];

      class Original {
        run() {
          calls.push('run');
        }
      }

      const Wrapped = SurrogateDelegate()(Original);

      SurrogatePre<Original>({
        handler: () => calls.push('pre'),
        options: { useNext: false },
      })(Wrapped.prototype, 'run');

      new Wrapped().run();

      expect(calls).to.deep.equal(['pre', 'run']);
    });

    it('should run hooks once when a class is wrapped twice', () => {
      const calls: string[] = [];

      class Original {
        @SurrogatePre<Original>({
          handler: () => calls.push('pre'),
          options: { useNext: false },
        })
        run() {
          calls.push('run');
        }
      }

      const Wrapped = SurrogateDelegate()(SurrogateDelegate()(Original));

      new Wrapped().run();

      expect(calls).to.deep.equal(['pre', 'run']);
    });
  });
});