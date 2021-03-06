import { Guitar } from './lib/guitar';
import { expect } from 'chai';
import sinon from 'sinon';
import {
  BOTH,
  INext,
  NextFor,
  NextPre,
  NextPost,
  SurrogateFor,
  NextAsyncPre,
  SurrogatePre,
  NextAsyncPost,
  SurrogatePost,
  SurrogateHandler,
  SurrogateAsyncPre,
  SurrogateDelegate,
  SurrogateAsyncPost,
} from '../src';

describe('SurrogateDecorators', () => {
  let log: sinon.SinonStub<any, void>;
  let logError: sinon.SinonStub<any, void>;

  beforeEach(() => {
    logError = sinon.stub(console, 'error');
    log = sinon.stub(console, 'log');
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('SurrogateDelegate', () => {
    it('should be a function', () => {
      expect(SurrogateDelegate).to.be.a('function');
    });
  });

  describe('SurrogateFor', () => {
    it('should be a function', () => {
      expect(SurrogateFor).to.be.a('function');
    });

    it('should decorate for BOTH pre and post methods', () => {
      const value = 'SurrogateForTest';

      @SurrogateDelegate<SurrogateForTest>()
      class SurrogateForTest {
        @SurrogateFor<SurrogateForTest>({
          type: BOTH,
          options: {
            handler: () => console.log(`Next handler called`),
            options: {
              useNext: false,
            },
          },
        })
        testMethod() {
          return value;
        }
      }

      const test = new SurrogateForTest();

      const result = test.testMethod();

      expect(result).to.equal(value);
      sinon.assert.calledTwice(log);
    });
  });

  describe('SurrogatePre', () => {
    it('should be a function', () => {
      expect(SurrogatePre).to.be.a('function');
    });

    it('should run pre hooks', () => {
      const guitar = new Guitar();

      guitar.play();
    });

    it('should pre decorate a synchronous method', () => {
      const handler: SurrogateHandler<Test> = sinon.spy((next: INext<Test>) =>
        next.next(),
      ) as any;
      const results = 'SurrogatePre';

      @SurrogateDelegate()
      class Test {
        @SurrogatePre<Test>(handler)
        method() {
          return results;
        }
      }

      const test = new Test();

      const result = test.method();

      sinon.assert.called(handler as any);
      expect(result).to.equal(results);
    });
  });

  describe('SurrogatePost', () => {
    it('should be a function', () => {
      expect(SurrogatePost).to.be.a('function');
    });

    it('should post decorate a synchronous method', () => {
      const handler: SurrogateHandler<Test> = sinon.spy((next: INext<Test>) =>
        next.next(),
      ) as any;
      const results = 'SurrogatePost';

      @SurrogateDelegate({ useSingleton: false })
      class Test {
        @SurrogatePost<Test>(handler)
        method() {
          return results;
        }
      }

      const test = new Test();

      const result = test.method();

      sinon.assert.called(handler as any);
      expect(result).to.equal(results);
    });
  });

  describe('SurrogateAsyncPost', () => {
    it('should be a function', () => {
      expect(SurrogateAsyncPost).to.be.a('function');
    });

    it('should post decorate an async method', async () => {
      const handler: SurrogateHandler<Test> = sinon.spy((next: INext<Test>) =>
        next.next(),
      ) as any;
      const results = 'SurrogateAsyncPost';

      @SurrogateDelegate()
      class Test {
        @SurrogateAsyncPost<Test>(handler)
        async method() {
          return results;
        }
      }

      const test = new Test();

      const result = await test.method();

      sinon.assert.called(handler as any);
      expect(result).to.equal(results);
    });
  });

  describe('SurrogateAsyncPre', () => {
    it('should be a function', () => {
      expect(SurrogateAsyncPre).to.be.a('function');
    });

    it('should pre decorate an async method', async () => {
      const handler: SurrogateHandler<Test> = sinon.spy((next: INext<Test>) =>
        next.next(),
      ) as any;
      const results = 'SurrogateAsyncPre';

      @SurrogateDelegate()
      class Test {
        @SurrogateAsyncPre<Test>(handler)
        async method() {
          return results;
        }
      }

      const test = new Test();

      const result = await test.method();

      sinon.assert.called(handler as any);
      expect(result).to.equal(results);
    });

    it('should pre decorate an async method and bail', async () => {
      const handler: SurrogateHandler<Test> = sinon.spy((next: INext<Test>) =>
        next.next({
          bail: true,
        }),
      ) as any;
      const results = 'SurrogateAsyncPreBail';

      @SurrogateDelegate()
      class Test {
        @SurrogateAsyncPre<Test>(handler)
        async method() {
          return results;
        }
      }

      const test = new Test();
      const result = await test.method();

      sinon.assert.called(handler as any);
      expect(result).to.be.undefined;
    });

    it('should pre decorate an async method and bail with', async () => {
      const results = 'SurrogateAsyncPreBailWith';
      const handler: SurrogateHandler<Test> = sinon.spy((next: INext<Test>) =>
        next.next({
          bail: true,
          bailWith: results,
        }),
      ) as any;

      @SurrogateDelegate()
      class Test {
        @SurrogateAsyncPre<Test>(handler)
        async method() {
          return 'SurrogateAsyncPreBailWithNotThis';
        }
      }

      const test = new Test();
      const result = await test.method();

      sinon.assert.called(handler as any);
      expect(result).to.equal(results);
    });

    it('should pre decorate an async method without using next', async () => {
      const handler: SurrogateHandler<Test> = sinon.spy(() => Promise.resolve());
      const results = 'SurrogateAsyncPreWithoutNext';

      @SurrogateDelegate()
      class Test {
        @SurrogateAsyncPre<Test>({ handler, options: { useNext: false } })
        async method() {
          return results;
        }
      }

      const test = new Test();

      const result = await test.method();

      sinon.assert.called(handler as any);
      expect(result).to.equal(results);
    });

    it('should pre decorate an async method without using next passing instance', async () => {
      const handler: SurrogateHandler<Test> = sinon.spy(async (instance) => {
        expect(instance).to.not.equal(test);
        expect(instance).to.be.instanceOf(Test);

        return Promise.resolve();
      });
      const results = 'SurrogateAsyncPreWithoutNextWithInstance';

      @SurrogateDelegate()
      class Test {
        @SurrogateAsyncPre<Test>({ handler, options: { useNext: false, passInstance: true } })
        async method() {
          return results;
        }
      }

      const test = new Test();

      const result = await test.method();

      sinon.assert.called(handler as any);
      expect(result).to.equal(results);
    });

    it('should pre decorate an async method without using next passing surrogate', async () => {
      const results = 'SurrogateAsyncPreWithoutNextWithSurrogate';
      const handler: SurrogateHandler<Test> = sinon.spy(async (surrogate) => {
        expect(surrogate).to.equal(test);
        expect(surrogate).to.be.instanceOf(Test);

        return Promise.resolve();
      });

      @SurrogateDelegate()
      class Test {
        @SurrogateAsyncPre<Test>({ handler, options: { useNext: false, passSurrogate: true } })
        async method() {
          return results;
        }
      }

      const test = new Test();

      const result = await test.method();

      sinon.assert.called(handler as any);
      expect(result).to.equal(results);
    });

    it('should pre decorate an async method without using next passing instance and surrogate', async () => {
      const results = 'SurrogateAsyncPreWithoutNextWithInstanceAndSurrogate';
      const handler: SurrogateHandler<Test> = sinon.spy(async (instance, surrogate) => {
        expect(surrogate).to.equal(test);
        expect(instance).to.not.equal(test);
        expect(surrogate).to.be.instanceOf(Test);
        expect(instance).to.be.instanceOf(Test);

        return Promise.resolve();
      });

      @SurrogateDelegate()
      class Test {
        @SurrogateAsyncPre<Test>({
          handler,
          options: { useNext: false, passSurrogate: true, passInstance: true },
        })
        async method() {
          return results;
        }
      }

      const test = new Test();

      const result = await test.method();

      sinon.assert.called(handler as any);
      expect(result).to.equal(results);
    });
  });

  describe('NextFor', () => {
    it('should be a function', () => {
      expect(NextFor).to.be.a('function');
    });

    it('should decorate as Next for BOTH pre and post methods', () => {
      const value = 'NextForTest';

      @SurrogateDelegate<NextForTest>()
      class NextForTest {
        @NextFor<NextForTest>({
          action: 'testMethod',
          type: BOTH,
          options: {
            useNext: false,
          },
        })
        protected nextHandler() {
          console.log(`Next handler called`);
        }

        testMethod() {
          return value;
        }
      }

      const test = new NextForTest();

      const result = test.testMethod();

      expect(result).to.equal(value);
      sinon.assert.calledTwice(log);
    });
  });

  describe('NextPre', () => {
    it('should be a function', () => {
      expect(NextPre).to.be.a('function');
    });

    it('should decorate as Next for a pre method', () => {
      const value = 'NextPreTest';

      @SurrogateDelegate<NextPreTest>()
      class NextPreTest {
        @NextPre<NextPreTest>({
          action: 'testMethod',
          options: {
            useNext: false,
          },
        })
        protected nextHandler() {
          console.log(`Next handler called`);
        }

        testMethod() {
          return value;
        }
      }

      const test = new NextPreTest();

      const result = test.testMethod();

      sinon.assert.calledOnce(log);
      expect(result).to.equal(value);
    });

    it('should decorate as Next for any number pre methods', () => {
      const value = 'NextPreTest';

      @SurrogateDelegate<NextPreTest>()
      class NextPreTest {
        @NextPre<NextPreTest>({
          action: ['testMethod1', 'testMethod2', 'testMethod3'],
          options: {
            useNext: false,
          },
        })
        protected nextHandler() {
          console.log(`Next handler called`);
        }

        testMethod1() {
          return value + '1';
        }

        testMethod2() {
          return value + '2';
        }

        testMethod3() {
          return value + '3';
        }
      }

      const test = new NextPreTest();

      const result1 = test.testMethod1();
      const result2 = test.testMethod2();
      const result3 = test.testMethod3();

      expect(result1).to.equal(value + '1');
      expect(result2).to.equal(value + '2');
      expect(result3).to.equal(value + '3');

      sinon.assert.calledThrice(log);
    });
  });

  describe('NextPost', () => {
    it('should be a function', () => {
      expect(NextPost).to.be.a('function');
    });

    it('should decorate as Next for a post method', () => {
      const value = 'NextPostTest';

      @SurrogateDelegate<NextPostTest>()
      class NextPostTest {
        @NextPost<NextPostTest>({
          action: 'testMethod',
          options: {
            useNext: false,
          },
        })
        protected nextHandler() {
          console.log(`Next handler called`);
        }

        testMethod() {
          return value;
        }
      }

      const test = new NextPostTest();

      const result = test.testMethod();

      sinon.assert.calledOnce(log);
      expect(result).to.equal(value);
    });

    it('should decorate as Next for any number post methods', () => {
      const value = 'NextPostTest';

      @SurrogateDelegate<NextPostTest>()
      class NextPostTest {
        @NextPost<NextPostTest>({
          action: ['testMethod1', 'testMethod2', 'testMethod3'],
          options: {
            useNext: false,
          },
        })
        protected nextHandler() {
          console.log(`Next handler called`);
        }

        testMethod1() {
          return value + '1';
        }

        testMethod2() {
          return value + '2';
        }

        testMethod3() {
          return value + '3';
        }
      }

      const test = new NextPostTest();

      const result1 = test.testMethod1();
      const result2 = test.testMethod2();
      const result3 = test.testMethod3();

      expect(result1).to.equal(value + '1');
      expect(result2).to.equal(value + '2');
      expect(result3).to.equal(value + '3');

      sinon.assert.calledThrice(log);
    });
  });

  describe('NextAsyncPost', () => {
    it('should be a function', () => {
      expect(NextAsyncPost).to.be.a('function');
    });

    it('should decorate as Next for an async post method', async () => {
      const value = 'NextAsyncPostTest';

      @SurrogateDelegate<NextAsyncPostTest>()
      class NextAsyncPostTest {
        @NextAsyncPost<NextAsyncPostTest>({
          action: 'testMethod',
          options: {
            useNext: false,
          },
        })
        protected async nextHandler() {
          console.log(`Next handler called`);
        }

        async testMethod() {
          return value;
        }
      }

      const test = new NextAsyncPostTest();

      const result = await test.testMethod();

      sinon.assert.calledOnce(log);
      expect(result).to.equal(value);
    });

    it('should decorate as Next for any number async post methods', async () => {
      const value = 'NextAsyncPostTest';

      @SurrogateDelegate<NextAsyncPostTest>()
      class NextAsyncPostTest {
        @NextAsyncPost<NextAsyncPostTest>({
          action: ['testMethod1', 'testMethod2', 'testMethod3'],
        })
        protected nextHandler(next: INext<NextAsyncPostTest>) {
          console.log(`Next handler called`);

          next.next();
        }

        async testMethod1() {
          return value + '1';
        }

        async testMethod2() {
          return value + '2';
        }

        async testMethod3() {
          return value + '3';
        }
      }

      const test = new NextAsyncPostTest();

      const result1 = await test.testMethod1();
      const result2 = await test.testMethod2();
      const result3 = await test.testMethod3();

      expect(result1).to.equal(value + '1');
      expect(result2).to.equal(value + '2');
      expect(result3).to.equal(value + '3');

      sinon.assert.calledThrice(log);
    });
  });

  describe('NextAsyncPre', () => {
    it('should be a function', () => {
      expect(NextAsyncPre).to.be.a('function');
    });

    it('should decorate as Next for an async pre method', async () => {
      const value = 'NextAsyncPreTest';

      @SurrogateDelegate<NextAsyncPreTest>()
      class NextAsyncPreTest {
        @NextAsyncPre<NextAsyncPreTest>({
          action: 'testMethod',
          options: {
            useNext: false,
          },
        })
        protected async nextHandler() {
          console.log(`Next handler called`);
        }

        async testMethod() {
          return value;
        }
      }

      const test = new NextAsyncPreTest();

      const result = await test.testMethod();

      sinon.assert.calledOnce(log);
      expect(result).to.equal(value);
    });

    it('should decorate as Next for any number async pre methods', async () => {
      const value = 'NextAsyncPreTest';

      @SurrogateDelegate<NextAsyncPreTest>()
      class NextAsyncPreTest {
        @NextAsyncPre<NextAsyncPreTest>({
          action: ['testMethod1', 'testMethod2', 'testMethod3'],
        })
        protected nextHandler(next: INext<NextAsyncPreTest>) {
          console.log(`Next handler called`);

          next.next();
        }

        async testMethod1() {
          return value + '1';
        }

        async testMethod2() {
          return value + '2';
        }

        async testMethod3() {
          return value + '3';
        }
      }

      const test = new NextAsyncPreTest();

      const result1 = await test.testMethod1();
      const result2 = await test.testMethod2();
      const result3 = await test.testMethod3();

      expect(result1).to.equal(value + '1');
      expect(result2).to.equal(value + '2');
      expect(result3).to.equal(value + '3');

      sinon.assert.calledThrice(log);
    });
  });
});
