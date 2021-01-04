import { wrapSurrogate, Surrogate, INext, SurrogateContext } from '../src';
import { FinalNext, PreMethodNext, Next } from '../src/next';
import { Network } from './lib/network';
import * as sinon from 'sinon';
import { expect } from 'chai';

describe('Next', () => {
  let network: Surrogate<Network>;
  let log: sinon.SinonStub<any, void>;
  let logError: sinon.SinonStub<any, void>;

  beforeEach(() => {
    logError = sinon.stub(console, 'error');
    network = wrapSurrogate(new Network());
    log = sinon.stub(console, 'log');
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('General', () => {
    it('should pass Next objects to the callbacks', () => {
      const func1 = sinon.spy(function (next: INext<Network>) {
        expect(next).to.be.instanceOf(Next);

        next.next();
      });

      const func2 = sinon.spy((next: INext<Network>) => {
        expect(next).to.be.instanceOf(FinalNext);

        next.next();
      });

      network.getSurrogate().registerPreHook('connect', [func1, func2]);
      network.connect();

      sinon.assert.calledOnce(func1);
      sinon.assert.calledOnce(func2);
      sinon.assert.calledOnce(log);
    });

    it('should call handlers with the proxied (unwrapped) object as context', () => {
      network
        .getSurrogate()
        .registerPreHook('connect', function (this: Network, next: INext<Network>) {
          expect(this).to.be.instanceOf(Network);
          expect(this).to.not.equal(network);
          next.next();
        });

      network.connect();
    });

    it('should call handlers with the surrogate (wrapped) object as context', () => {
      network.getSurrogate().registerPreHook(
        'connect',
        function (this: Network, next: INext<Network>) {
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
        function (this: Network, next: INext<Network>) {
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

    it('should pass arguments from one handler to the next', () => {
      network.getSurrogate().registerPreHook('connect', [
        (next: INext<Network>) => next.next({ using: [1, 2, 3] }),
        (next: INext<Network>, arg1: number, arg2: number, arg3: number) => {
          expect(arg1).to.be.a('number');
          expect(arg2).to.be.a('number');
          expect(arg3).to.be.a('number');
          expect(arg1).to.equal(1);
          expect(arg2).to.equal(2);
          expect(arg3).to.equal(3);
          next.next();
        },
      ]);

      network.connect();
    });
  });

  describe('Skip', () => {
    it('should skip a single handler', () => {
      const func1 = sinon.spy((next: INext<Network>) => next.skip());
      const func2 = sinon.spy((next: INext<Network>) => next.next());
      const func3 = sinon.spy((next: INext<Network>) => next.next());

      network.getSurrogate().registerPreHook('connect', [func1, func2, func3]);
      network.connect();

      sinon.assert.calledOnce(func1);
      sinon.assert.notCalled(func2);
      sinon.assert.calledOnce(func3);
      sinon.assert.calledOnce(log);
    });

    it('should skip multiple handlers', () => {
      const func1 = sinon.spy((next: INext<Network>) => next.skip(2));
      const func2 = sinon.spy((next: INext<Network>) => next.next());
      const func3 = sinon.spy((next: INext<Network>) => next.next());
      const func4 = sinon.spy((next: INext<Network>) => next.next());

      network.getSurrogate().registerPreHook('connect', [func1, func2, func3, func4]);
      network.connect();

      sinon.assert.calledOnce(func1);
      sinon.assert.notCalled(func2);
      sinon.assert.notCalled(func3);
      sinon.assert.calledOnce(func4);
      sinon.assert.calledOnce(log);
    });

    it('should skip multiple handlers when called multiple times', () => {
      const func1 = sinon.spy((next: INext<Network>) => next.skip(2));
      const func2 = sinon.spy((next: INext<Network>) => next.next());
      const func3 = sinon.spy((next: INext<Network>) => next.next());
      const func4 = sinon.spy((next: INext<Network>) => next.next());

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
      const func1 = sinon.spy((next: INext<Network>) => next.next());
      const func2 = sinon.spy((next: INext<Network>) => next.skip(2));
      const func3 = sinon.spy((next: INext<Network>) => next.next());
      const func4 = sinon.spy((next: INext<Network>) => next.next());
      const func5 = sinon.spy((next: INext<Network>) => next.next());

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
      const func1 = sinon.spy((next: INext<Network>) => next.next());
      const func2 = sinon.spy((next: INext<Network>) => next.skip(20));
      const func3 = sinon.spy((next: INext<Network>) => next.next());
      const func4 = sinon.spy((next: INext<Network>) => next.next());

      network.getSurrogate().registerPreHook('connect', [func1, func2, func3, func4]);

      network.connect();

      sinon.assert.calledOnce(func1);
      sinon.assert.calledOnce(func2);
      sinon.assert.notCalled(func3);
      sinon.assert.notCalled(func4);
      sinon.assert.calledOnce(log);
    });

    it('should not skip post handlers when skipping pre handlers', () => {
      const func1 = sinon.spy((next: INext<Network>) => next.next());
      const func2 = sinon.spy((next: INext<Network>) => next.skip(20));
      const func3 = sinon.spy((next: INext<Network>) => next.next());
      const func4 = sinon.spy((next: INext<Network>) => next.next());
      const func5 = sinon.spy((next: INext<Network>) => next.next());

      const func6 = sinon.spy((next: INext<Network>) => next.next());
      const func7 = sinon.spy((next: INext<Network>) => next.next());
      const func8 = sinon.spy((next: INext<Network>) => next.next());
      const func9 = sinon.spy((next: INext<Network>) => next.next());

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
      const func1 = sinon.spy((next: INext<Network>) => next.next());
      const func2 = sinon.spy((next: INext<Network>) => next.skip(20));
      const func3 = sinon.spy((next: INext<Network>) => next.next());
      const func4 = sinon.spy((next: INext<Network>) => next.next());
      const func5 = sinon.spy((next: INext<Network>) => next.next());

      const func6 = sinon.spy((next: INext<Network>) => next.next());
      const func7 = sinon.spy((next: INext<Network>) => next.skip());
      const func8 = sinon.spy((next: INext<Network>) => next.next());
      const func9 = sinon.spy((next: INext<Network>) => next.next());

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

      const func1 = sinon.spy((next: INext<Network>) => {
        expect(next).to.be.instanceOf(Next);

        next.next({ error });
      });
      const func2 = sinon.spy((next: INext<Network>) => next.next());

      network.getSurrogate().registerPreHook('connect', [func1, func2]);

      expect(() => network.connect()).to.throw(error.message);
      sinon.assert.calledOnce(func1);
      sinon.assert.notCalled(func2);
    });

    it('should throw an error on FinalNext(PRE)', () => {
      const error = new Error('fail');

      const func1 = sinon.spy((next: INext<Network>) => next.next());
      const func2 = sinon.spy((next: INext<Network>) => {
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

      const func1 = sinon.spy((next: INext<Network>) => {
        expect(next).to.be.instanceOf(Next);

        next.next({ error });
      });
      const func2 = sinon.spy(
        (passedError: Error, next: INext<Network>, instance: Network) => {
          expect(passedError).to.equal(error);
          expect(instance).to.be.undefined;

          next.next();
        },
      );

      network.getSurrogate().registerPreHook('connect', [func1, func2], {
        passErrors: true,
        ignoreErrors: true,
      });

      network.connect();

      sinon.assert.calledOnce(func1);
      sinon.assert.calledOnce(func2);
    });

    it('should throw error received from Next(POST)', () => {
      const error = new Error('fail');

      const func1 = sinon.spy((next: INext<Network>) => {
        expect(next).to.be.instanceOf(Next);

        next.next({ error });
      });
      const func2 = sinon.spy((next: INext<Network>) => next.next());

      network.getSurrogate().registerPostHook('connect', [func1, func2]);

      expect(() => network.connect()).to.throw(error.message);
      sinon.assert.calledOnce(func1);
      sinon.assert.notCalled(func2);
    });

    it('should throw error received from Next(PRE) when using ASYNC wrapper', async () => {
      const error = new Error('fail');
      let errorThrown = false;

      const connect = sinon.spy(network, 'connect');

      const func1 = sinon.spy((next: INext<Network>) => {
        expect(next).to.be.instanceOf(Next);

        next.next({ error });
      });
      const func2 = sinon.spy((next: INext<Network>) => next.next());

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

      const func1 = sinon.spy((next: INext<Network>) => {
        expect(next).to.be.instanceOf(Next);

        next.next({ error });
      });
      const func2 = sinon.spy((next: INext<Network>) => next.next());

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

      const func1 = sinon.spy((next: INext<Network>) => next.next());
      const func2 = sinon.spy((next: INext<Network>) => {
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

      const func1 = sinon.spy((next: INext<Network>) => {
        expect(next).to.be.instanceOf(Next);

        next.next({ error });
      });
      const func2 = sinon.spy(
        (passedError: Error, next: INext<Network>, instance: Network) => {
          expect(passedError).to.equal(error);
          expect(instance).to.equal(next.instance);

          next.next();
        },
      );

      network.getSurrogate().registerPostHook('connect', [func1, func2], {
        passErrors: true,
        ignoreErrors: true,
        passInstance: true,
      });

      network.connect();

      sinon.assert.calledOnce(func1);
      sinon.assert.calledOnce(func2);
    });
  });
});
