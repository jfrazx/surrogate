import { wrapSurrogate, Surrogate, NextHandler, SurrogateContext } from '../src';
import { FinalNext, PreMethodNext, Next } from '../src/next';
import { Network } from './lib/network';
import * as sinon from 'sinon';
import { expect } from 'chai';

describe('Next', () => {
  let network: Surrogate<Network>;
  let log: sinon.SinonStub<any, void>;

  beforeEach(() => {
    network = wrapSurrogate(new Network());
    log = sinon.stub(console, 'log');
    sinon.stub(console, 'error');
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('General', () => {
    it('should pass NextHandler objects to the callbacks', () => {
      const func1 = sinon.spy(function ({ next }: NextHandler<Network>) {
        expect(next).to.be.instanceOf(Next);

        next.next();
      });

      const func2 = sinon.spy(({ next }: NextHandler<Network>) => {
        expect(next).to.be.instanceOf(FinalNext);

        next.next();
      });

      network.getSurrogate().registerPreHook('connect', [func1, func2]);
      network.connect();

      sinon.assert.calledOnce(func1);
      sinon.assert.calledOnce(func2);
      sinon.assert.calledOnce(log);
    });

    it('should pass arguments from one handler to the next', () => {
      network.getSurrogate().registerPreHook('connect', [
        ({ next }: NextHandler<Network>) => next.next({ using: [0, 1, 2, 3] }),
        ({ next, receivedArgs }: NextHandler<Network>) => {
          receivedArgs.forEach((value, index) => {
            expect(value).to.be.a('number');
            expect(value).to.equal(index);
          });

          next.next();
        },
      ]);

      network.connect();
    });

    it('should pass the original arguments', () => {
      const serverName = 'server name';

      network.getSurrogate().registerPreHook('checkServer', [
        ({ originalArgs }: NextHandler<Network>) => {
          expect(originalArgs).to.be.an('array');
          expect(originalArgs[0]).to.equal(serverName);
        },
      ]);

      network.checkServer(serverName);
    });

    it('should not pass any arguments', () => {
      const serverName = 'server name no args';

      network.getSurrogate().registerPreHook(
        'checkServer',
        [
          (...values) => {
            expect(values).to.have.lengthOf(0);
          },
        ],
        {
          noArgs: true,
        },
      );

      const result = network.checkServer(serverName);

      expect(result).to.equal(serverName);
    });

    it('should not pass any arguments when async', async () => {
      const serverName = 'server name no args async';

      network.getSurrogate().registerPreHook(
        'checkServerAsync',
        [
          async (...values) => {
            expect(values).to.have.lengthOf(0);
          },
        ],
        {
          noArgs: true,
          useNext: false,
          wrapper: 'async',
        },
      );

      const result = await network.checkServerAsync(serverName);

      expect(result).to.equal(serverName);
    });

    it('should pass the current target method', () => {
      const serverName = 'server name';

      network.getSurrogate().registerPreHook('checkServer', [
        ({ action }: NextHandler<Network>) => {
          expect(action).to.be.an('string');
          expect(action).to.equal('checkServer');
        },
      ]);

      network.checkServer(serverName);
    });

    it('should pass the current hook', () => {
      const serverName = 'server name';

      network
        .getSurrogate()
        .registerPreHook(
          'checkServer',
          [
            ({ hookType }: NextHandler<Network>) => {
              expect(hookType).to.be.a('string');
              expect(hookType).to.equal('pre');
            },
          ],
          { useNext: false },
        )
        .registerPostHook(
          'checkServer',
          ({ hookType }: NextHandler<Network>) => {
            expect(hookType).to.be.a('string');
            expect(hookType).to.equal('post');
          },
          { useNext: false },
        );

      const name = network.checkServer(serverName);

      expect(name).to.equal(serverName);
    });
  });

  describe('HandlerContext', () => {
    it('should call handlers with the proxied (unwrapped) object as context', () => {
      network
        .getSurrogate()
        .registerPreHook('connect', function (this: Network, { next }: NextHandler<Network>) {
          expect(this).to.be.instanceOf(Network);
          expect(this).to.not.equal(network);
          next.next();
        });

      network.connect();
    });

    it('should call handlers with the surrogate (wrapped) object as context', () => {
      network.getSurrogate().registerPreHook(
        'connect',
        function (this: Network, { next }: NextHandler<Network>) {
          expect(this).to.be.instanceOf(Network);
          expect(this).to.equal(network);
          next.next();
        },
        {
          useContext: SurrogateContext.Surrogate,
        },
      );

      network.connect();
    });

    it('should call handlers with the passed options object as context', () => {
      const otherNetwork = new Network();

      network.getSurrogate().registerPreHook(
        'connect',
        function (this: Network, { next }: NextHandler<Network>) {
          expect(this).to.be.instanceOf(Network);
          expect(this).to.equal(otherNetwork);
          next.next();
        },
        {
          useContext: otherNetwork,
        },
      );

      network.connect();
    });

    it('should run with a global context', () => {
      class GlobalContextTest {
        method(instance: GlobalContextTest) {
          expect(
            this,
            'GlobalContextTest method "this" is not equal to passed instance',
          ).to.equal(instance);
        }
      }

      const instance = new GlobalContextTest();

      const globalContextTest = wrapSurrogate(instance, {
        useContext: 'surrogate',
      });

      globalContextTest
        .getSurrogate()
        .registerPreHook('method', function (this: GlobalContextTest, { next, surrogate }) {
          expect(
            surrogate,
            'GlobalContextTest NextHandler Surrogate is not equal to this',
          ).to.equal(this);

          next.next();
        });

      globalContextTest.method(instance);
    });

    it('should method specific context should override global context', () => {
      class GlobalContextTest {
        method(instance: GlobalContextTest) {
          expect(
            this,
            'GlobalContextTest method "this" is not equal to passed instance',
          ).to.equal(instance);
        }
      }

      const instance = new GlobalContextTest();

      const globalContextTest = wrapSurrogate(instance, {
        useContext: 'instance',
      });

      globalContextTest
        .getSurrogate()
        .registerPreHook('method', function (this: GlobalContextTest, { next, surrogate }) {
          expect(
            surrogate,
            'GlobalContextTest NextHandler Surrogate is equal to this',
          ).not.to.equal(this);

          next.next();
        });

      globalContextTest.method(instance);
    });
  });

  describe('Skip', () => {
    it('should skip a single handler', () => {
      const func1 = sinon.spy(({ next }: NextHandler<Network>) => next.skip());
      const func2 = sinon.spy(({ next }: NextHandler<Network>) => next.next());
      const func3 = sinon.spy(({ next }: NextHandler<Network>) => next.next());

      network.getSurrogate().registerPreHook('connect', [func1, func2, func3]);
      network.connect();

      sinon.assert.calledOnce(func1);
      sinon.assert.notCalled(func2);
      sinon.assert.calledOnce(func3);
      sinon.assert.calledOnce(log);
    });

    it('should skip multiple handlers', () => {
      const func1 = sinon.spy(({ next }: NextHandler<Network>) => next.skip(2));
      const func2 = sinon.spy(({ next }: NextHandler<Network>) => next.next());
      const func3 = sinon.spy(({ next }: NextHandler<Network>) => next.next());
      const func4 = sinon.spy(({ next }: NextHandler<Network>) => next.next());

      network.getSurrogate().registerPreHook('connect', [func1, func2, func3, func4]);
      network.connect();

      sinon.assert.calledOnce(func1);
      sinon.assert.notCalled(func2);
      sinon.assert.notCalled(func3);
      sinon.assert.calledOnce(func4);
      sinon.assert.calledOnce(log);
    });

    it('should skip multiple handlers when called multiple times', () => {
      const func1 = sinon.spy(({ next }: NextHandler<Network>) => next.skip(2));
      const func2 = sinon.spy(({ next }: NextHandler<Network>) => next.next());
      const func3 = sinon.spy(({ next }: NextHandler<Network>) => next.next());
      const func4 = sinon.spy(({ next }: NextHandler<Network>) => next.next());

      network.getSurrogate().registerPreHook('connect', [func1, func2, func3, func4]);
      network.connect();
      network.connect();

      sinon.assert.callCount(func1, 2);
      sinon.assert.notCalled(func2);
      sinon.assert.notCalled(func3);
      sinon.assert.callCount(func4, 2);
      sinon.assert.callCount(log, 2);
    });

    it('should skip and the resume the next chain', () => {
      const func1 = sinon.spy(({ next }: NextHandler<Network>) => next.next());
      const func2 = sinon.spy(({ next }: NextHandler<Network>) => next.skip(2));
      const func3 = sinon.spy(({ next }: NextHandler<Network>) => next.next());
      const func4 = sinon.spy(({ next }: NextHandler<Network>) => next.next());
      const func5 = sinon.spy(({ next }: NextHandler<Network>) => next.next());

      network.getSurrogate().registerPreHook('connect', [func1, func2, func3, func4, func5]);
      network.connect();

      sinon.assert.calledOnce(func1);
      sinon.assert.calledOnce(func2);
      sinon.assert.notCalled(func3);
      sinon.assert.notCalled(func4);
      sinon.assert.calledOnce(func5);
      sinon.assert.calledOnce(log);
    });

    it('should not skip the calling method', () => {
      const func1 = sinon.spy(({ next }: NextHandler<Network>) => next.next());
      const func2 = sinon.spy(({ next }: NextHandler<Network>) => next.skip(20));
      const func3 = sinon.spy(({ next }: NextHandler<Network>) => next.next());
      const func4 = sinon.spy(({ next }: NextHandler<Network>) => next.next());

      network.getSurrogate().registerPreHook('connect', [func1, func2, func3, func4]);

      network.connect();

      sinon.assert.calledOnce(func1);
      sinon.assert.calledOnce(func2);
      sinon.assert.notCalled(func3);
      sinon.assert.notCalled(func4);
      sinon.assert.calledOnce(log);
    });

    it('should not skip post handlers when skipping pre handlers', () => {
      const func1 = sinon.spy(({ next }: NextHandler<Network>) => next.next());
      const func2 = sinon.spy(({ next }: NextHandler<Network>) => next.skip(20));
      const func3 = sinon.spy(({ next }: NextHandler<Network>) => next.next());
      const func4 = sinon.spy(({ next }: NextHandler<Network>) => next.next());
      const func5 = sinon.spy(({ next }: NextHandler<Network>) => next.next());

      const func6 = sinon.spy(({ next }: NextHandler<Network>) => next.next());
      const func7 = sinon.spy(({ next }: NextHandler<Network>) => next.next());
      const func8 = sinon.spy(({ next }: NextHandler<Network>) => next.next());
      const func9 = sinon.spy(({ next }: NextHandler<Network>) => next.next());

      network
        .getSurrogate()
        .registerPreHook('connect', [func1, func2, func3, func4, func5])
        .registerPostHook('connect', [func6, func7, func8, func9]);

      network.connect();

      sinon.assert.calledOnce(func1);
      sinon.assert.calledOnce(func2);
      sinon.assert.notCalled(func3);
      sinon.assert.notCalled(func4);
      sinon.assert.notCalled(func5);
      sinon.assert.calledOnce(log);
      sinon.assert.calledOnce(func6);
      sinon.assert.calledOnce(func7);
      sinon.assert.calledOnce(func8);
      sinon.assert.calledOnce(func9);
    });

    it('should skip pre and post handlers', () => {
      const func1 = sinon.spy(({ next }: NextHandler<Network>) => next.next());
      const func2 = sinon.spy(({ next }: NextHandler<Network>) => next.skip(20));
      const func3 = sinon.spy(({ next }: NextHandler<Network>) => next.next());
      const func4 = sinon.spy(({ next }: NextHandler<Network>) => next.next());
      const func5 = sinon.spy(({ next }: NextHandler<Network>) => next.next());

      const func6 = sinon.spy(({ next }: NextHandler<Network>) => next.next());
      const func7 = sinon.spy(({ next }: NextHandler<Network>) => next.skip());
      const func8 = sinon.spy(({ next }: NextHandler<Network>) => next.next());
      const func9 = sinon.spy(({ next }: NextHandler<Network>) => next.next());

      network
        .getSurrogate()
        .registerPreHook('connect', [func1, func2, func3, func4, func5])
        .registerPostHook('connect', [func6, func7, func8, func9]);

      network.connect();

      sinon.assert.calledOnce(func1);
      sinon.assert.calledOnce(func2);
      sinon.assert.notCalled(func3);
      sinon.assert.notCalled(func4);
      sinon.assert.notCalled(func5);
      sinon.assert.calledOnce(log);
      sinon.assert.calledOnce(func6);
      sinon.assert.calledOnce(func7);
      sinon.assert.notCalled(func8);
      sinon.assert.calledOnce(func9);
    });
  });

  describe('Error', () => {
    it('should throw error received from Next(PRE)', () => {
      const error = new Error('fail');

      const func1 = sinon.spy(({ next }: NextHandler<Network>) => {
        expect(next).to.be.instanceOf(Next);

        next.next({ error });
      });
      const func2 = sinon.spy(({ next }: NextHandler<Network>) => next.next());

      network.getSurrogate().registerPreHook('connect', [func1, func2]);

      expect(() => network.connect()).to.throw(error.message);
      sinon.assert.calledOnce(func1);
      sinon.assert.notCalled(func2);
    });

    it('should throw an error on FinalNext(PRE)', () => {
      const error = new Error('fail');

      const func1 = sinon.spy(({ next }: NextHandler<Network>) => next.next());
      const func2 = sinon.spy(({ next }: NextHandler<Network>) => {
        expect(next).to.be.instanceOf(FinalNext);
        expect(next).to.be.instanceOf(PreMethodNext);

        next.next({ error });
      });

      network.getSurrogate().registerPreHook('connect', [func1, func2]);

      expect(() => network.connect()).to.throw(error.message);
      sinon.assert.calledOnce(func1);
      sinon.assert.calledOnce(func2);
    });

    it('should ignore error received from Next(PRE)', () => {
      const error = new Error('fail');

      const func1 = sinon.spy(({ next }: NextHandler<Network>) => {
        expect(next).to.be.instanceOf(Next);

        next.next({ error });
      });
      const func2 = sinon.spy(({ next, error: passedError }: NextHandler<Network>) => {
        expect(passedError).to.equal(error);

        next.next();
      });

      network
        .getSurrogate()
        .registerPreHook('connect', [func1, func2], { ignoreErrors: true });

      network.connect();

      sinon.assert.calledOnce(func1);
      sinon.assert.calledOnce(func2);
    });

    it('should throw error received from Next(POST)', () => {
      const error = new Error('fail');

      const func1 = sinon.spy(({ next }: NextHandler<Network>) => {
        expect(next).to.be.instanceOf(Next);

        next.next({ error });
      });
      const func2 = sinon.spy(({ next }: NextHandler<Network>) => next.next());

      network.getSurrogate().registerPostHook('connect', [func1, func2]);

      expect(() => network.connect()).to.throw(error.message);
      sinon.assert.calledOnce(func1);
      sinon.assert.notCalled(func2);
    });

    it('should throw error received from Next(PRE) when using ASYNC wrapper', async () => {
      const error = new Error('fail');
      let errorThrown = false;

      const connect = sinon.spy(network, 'connect');

      const func1 = sinon.spy(({ next }: NextHandler<Network>) => {
        expect(next).to.be.instanceOf(Next);

        next.next({ error });
      });
      const func2 = sinon.spy(({ next }: NextHandler<Network>) => next.next());

      network.getSurrogate().registerPreHook('connect', [func1, func2], { wrapper: 'async' });

      try {
        await network.connect();
      } catch {
        errorThrown = true;
      }
      sinon.assert.calledOnce(func1);
      sinon.assert.notCalled(func2);
      sinon.assert.notCalled(connect);
      expect(errorThrown).to.be.true;
    });

    it('should throw error received from Next(POST) when using ASYNC wrapper', async () => {
      const error = new Error('fail');
      let errorThrown = false;

      const connect = sinon.spy(network, 'connect');

      const func1 = sinon.spy(({ next }: NextHandler<Network>) => {
        expect(next).to.be.instanceOf(Next);

        next.next({ error });
      });
      const func2 = sinon.spy(({ next }: NextHandler<Network>) => next.next());

      network.getSurrogate().registerPostHook('connect', [func1, func2], { wrapper: 'async' });

      try {
        await network.connect();
      } catch {
        errorThrown = true;
      }
      sinon.assert.calledOnce(connect);
      sinon.assert.calledOnce(func1);
      sinon.assert.notCalled(func2);
      expect(errorThrown).to.be.true;
    });

    it('should throw an error on FinalNext(POST)', () => {
      const error = new Error('fail');

      const func1 = sinon.spy(({ next }: NextHandler<Network>) => next.next());
      const func2 = sinon.spy(({ next }: NextHandler<Network>) => {
        expect(next).to.be.instanceOf(FinalNext);

        next.next({ error });
      });

      network.getSurrogate().registerPostHook('connect', [func1, func2]);

      expect(() => network.connect()).to.throw(error.message);
      sinon.assert.calledOnce(func1);
      sinon.assert.calledOnce(func2);
    });

    it('should ignore error received from Next(POST)', () => {
      const error = new Error('fail');

      const func1 = sinon.spy(({ next }: NextHandler<Network>) => {
        expect(next).to.be.instanceOf(Next);

        next.next({ error });
      });
      const func2 = sinon.spy(
        ({ next, instance, error: passedError }: NextHandler<Network>) => {
          expect(passedError).to.equal(error);
          expect(instance).to.equal(network.bypassSurrogate());

          next.next();
        },
      );

      network.getSurrogate().registerPostHook('connect', [func1, func2], {
        ignoreErrors: true,
      });

      network.connect();

      sinon.assert.calledOnce(func1);
      sinon.assert.calledOnce(func2);
    });
  });
});
