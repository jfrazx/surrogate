import { BugReport, logReporter } from './lib/reportable';
import { Guitar } from './lib/guitar';
import { expect } from 'chai';
import sinon from 'sinon';
import {
  NextPre,
  NextPost,
  NextAsyncPre,
  SurrogatePre,
  NextAsyncPost,
  SurrogatePost,
  NextParameters,
  NextPreAndPost,
  SurrogateHandler,
  SurrogateAsyncPre,
  SurrogateDelegate,
  SurrogateAsyncPost,
  NextAsyncPreAndPost,
  SurrogatePreAndPost,
  SurrogateAsyncPreAndPost,
} from '../src';

describe('SurrogateDecorators', () => {
  let log: sinon.SinonStub<any, void>;

  beforeEach(() => {
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

  describe('SurrogatePreAndPost', () => {
    it('should be a function', () => {
      expect(SurrogatePreAndPost).to.be.a('function');
    });

    it('should decorate for BOTH pre and post methods', () => {
      const value = 'SurrogatePreAndPostTest';

      @SurrogateDelegate<SurrogatePreAndPostTest>()
      class SurrogatePreAndPostTest {
        @SurrogatePreAndPost<SurrogatePreAndPostTest>({
          handler: () => console.log(`Next handler called`),
          options: {
            useNext: false,
          },
        })
        testMethod() {
          return value;
        }
      }

      const test = new SurrogatePreAndPostTest();

      const result = test.testMethod();

      expect(result).to.equal(value);
      sinon.assert.calledTwice(log);
    });
  });

  describe('SurrogateAsyncPreAndPost', () => {
    it('should be a function', () => {
      expect(SurrogateAsyncPreAndPost).to.be.a('function');
    });

    it('should decorate for BOTH async pre and post methods', async () => {
      const value = 'SurrogateAsyncPreAndPostTest';

      @SurrogateDelegate<SurrogateAsyncPreAndPostTest>()
      class SurrogateAsyncPreAndPostTest {
        @SurrogateAsyncPreAndPost<SurrogateAsyncPreAndPostTest>({
          handler: () => console.log(`Next handler called`),
          options: {
            useNext: false,
          },
        })
        async testMethod() {
          return value;
        }
      }

      const test = new SurrogateAsyncPreAndPostTest();

      const result = await test.testMethod();

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
      const handler: SurrogateHandler<Test> = sinon.spy(({ next }: NextParameters<Test>) =>
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
      const handler: SurrogateHandler<Test> = sinon.spy(({ next }: NextParameters<Test>) =>
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
      const handler: SurrogateHandler<Test> = sinon.spy(({ next }: NextParameters<Test>) =>
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
      const handler: SurrogateHandler<Test> = sinon.spy(({ next }: NextParameters<Test>) =>
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
      const handler: SurrogateHandler<Test> = sinon.spy(({ next }: NextParameters<Test>) =>
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
      const handler: SurrogateHandler<Test> = sinon.spy(({ next }: NextParameters<Test>) =>
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
      const handler: SurrogateHandler<Test> = sinon.spy(async ({ instance }) => {
        expect(instance).to.not.equal(test);
        expect(instance).to.be.instanceOf(Test);

        return Promise.resolve();
      });
      const results = 'SurrogateAsyncPreWithoutNextWithInstance';

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

    it('should pre decorate an async method without using next passing surrogate', async () => {
      const results = 'SurrogateAsyncPreWithoutNextWithSurrogate';
      const handler: SurrogateHandler<Test> = sinon.spy(async ({ surrogate }) => {
        expect(surrogate).to.equal(test);
        expect(surrogate).to.be.instanceOf(Test);

        return Promise.resolve();
      });

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

    it('should pre decorate an async method without using next passing instance and surrogate', async () => {
      const results = 'SurrogateAsyncPreWithoutNextWithInstanceAndSurrogate';
      const handler: SurrogateHandler<Test> = sinon.spy(async ({ instance, surrogate }) => {
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
          options: { useNext: false },
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

  describe('NextPreAndPost', () => {
    it('should be a function', () => {
      expect(NextPreAndPost).to.be.a('function');
    });

    it('should decorate as Next for BOTH pre and post methods', () => {
      const value = 'NextPreAndPostTest';

      @SurrogateDelegate<NextPreAndPostTest>()
      class NextPreAndPostTest {
        @NextPreAndPost<NextPreAndPostTest>({
          action: 'testMethod',
          options: {
            useNext: false,
          },
        })
        protected nextParameters() {
          console.log(`Next handler called`);
        }

        testMethod() {
          return value;
        }
      }

      const test = new NextPreAndPostTest();

      const result = test.testMethod();

      expect(result).to.equal(value);
      sinon.assert.calledTwice(log);
    });
  });

  describe('NextAsyncPreAndPost', () => {
    it('should be a function', () => {
      expect(NextAsyncPreAndPost).to.be.a('function');
    });

    it('should decorate as Async Next for BOTH pre and post methods', async () => {
      const value = 'NextAsyncPreAndPostTest';

      @SurrogateDelegate<NextAsyncPreAndPostTest>()
      class NextAsyncPreAndPostTest {
        @NextAsyncPreAndPost<NextAsyncPreAndPostTest>({
          action: 'testMethod',
          options: {
            useNext: false,
          },
        })
        protected async nextParameters() {
          console.log(`Next handler called`);
        }

        async testMethod() {
          return value;
        }
      }

      const test = new NextAsyncPreAndPostTest();

      const result = await test.testMethod();

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
        protected nextParameters() {
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
        protected nextParameters() {
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
        protected nextParameters() {
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
        protected nextParameters() {
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
        protected async nextParameters() {
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
        protected nextParameters({ next }: NextParameters<NextAsyncPostTest>) {
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
        protected async nextParameters() {
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
        protected nextParameters({ next }: NextParameters<NextAsyncPreTest>) {
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

  describe('AdditionalDecorators', () => {
    it('should provide hooks for classes with additional decorators', () => {
      const report = new BugReport('This is a test report');
      const message = `report to http://www.example.com`;

      const reported = {
        action: 'report',
        hookType: 'pre',
        title: 'This is a test report',
        reportType: 'report',
      };

      report.report();

      sinon.assert.calledOnce(logReporter);
      [message, reported].forEach((logged) => sinon.assert.calledWith(log, logged));
    });
  });
});
