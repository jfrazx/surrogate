import { wrapSurrogate, Surrogate, NextParameters } from '../src';
import { FinalNext, PreMethodNext, Next } from '../src/next';
import { Network } from './lib/network';
import * as sinon from 'sinon';
import { expect } from 'chai';

describe('Next', () => {
  let network: Surrogate<Network>;

  beforeEach(() => {
    network = wrapSurrogate(new Network());
    sinon.stub(console, 'error');
    sinon.stub(console, 'log');
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('General', () => {
    it('should pass the original arguments', () => {
      const serverName = 'server name';

      network.getSurrogate().registerPreHook(
        'checkServer',
        [
          ({ originalArgs }: NextParameters<Network>) => {
            expect(originalArgs).to.be.an('array');
            expect(originalArgs[0]).to.equal(serverName);
          },
        ],
        { useNext: false },
      );

      network.checkServer(serverName);
    });

    it('should pass the current arguments', () => {
      const serverName = 'server name';

      network.getSurrogate().registerPreHook(
        'checkServer',
        [
          ({ originalArgs, currentArgs }: NextParameters<Network>) => {
            expect(currentArgs).to.be.an('array');
            expect(currentArgs[0]).to.equal(serverName);

            expect(originalArgs).to.equal(currentArgs);
            expect(originalArgs === currentArgs).to.be.true;
          },
        ],
        { useNext: false },
      );

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
          useNext: false,
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

    it('should update the current arguments', () => {
      const serverName = 'update arguments test';
      const replace = 'replacement method args';

      network.getSurrogate().registerPreHook('checkServer', [
        ({ next }: NextParameters<Network>) => {
          next.next({ replace });
        },

        ({ next, currentArgs, originalArgs }: NextParameters<Network>) => {
          expect(currentArgs).to.be.an('array');
          expect(currentArgs === originalArgs).to.be.false;
          expect(currentArgs[0]).to.equal(replace);

          next.next();
        },
      ]);

      const result = network.checkServer(serverName);

      expect(result).to.not.equal(serverName);
      expect(result).to.equal(replace);
    });
  });

  describe('Error', () => {
    it('should throw error received from Next(PRE)', () => {
      const error = new Error('fail');

      const func1 = sinon.spy(({ next }: NextParameters<Network>) => {
        expect(next).to.be.instanceOf(Next);

        next.next({ error });
      });
      const func2 = sinon.spy(({ next }: NextParameters<Network>) => next.next());

      network.getSurrogate().registerPreHook('connect', [func1, func2]);

      expect(() => network.connect()).to.throw(error.message);
      sinon.assert.calledOnce(func1);
      sinon.assert.notCalled(func2);
    });

    it('should throw an error on FinalNext(PRE)', () => {
      const error = new Error('fail');

      const func1 = sinon.spy(({ next }: NextParameters<Network>) => next.next());
      const func2 = sinon.spy(({ next }: NextParameters<Network>) => {
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

      const func1 = sinon.spy(({ next }: NextParameters<Network>) => {
        expect(next).to.be.instanceOf(Next);

        next.next({ error });
      });
      const func2 = sinon.spy(({ next, error: passedError }: NextParameters<Network>) => {
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

      const func1 = sinon.spy(({ next }: NextParameters<Network>) => {
        expect(next).to.be.instanceOf(Next);

        next.next({ error });
      });
      const func2 = sinon.spy(({ next }: NextParameters<Network>) => next.next());

      network.getSurrogate().registerPostHook('connect', [func1, func2]);

      expect(() => network.connect()).to.throw(error.message);
      sinon.assert.calledOnce(func1);
      sinon.assert.notCalled(func2);
    });

    it('should catch and throw inside handler when using ASYNC wrapper and NOT using Next', async () => {
      const error = new Error('fail');
      let errorThrown = false;

      const connect = sinon.spy(network, 'asyncConnect');

      const func1 = sinon.spy(async ({ next }: NextParameters<Network>) => {
        expect(next).to.be.instanceOf(Next);

        throw error;
      });
      const func2 = sinon.spy(({ next }: NextParameters<Network>) => next.next());

      network
        .getSurrogate()
        .registerPreHook('asyncConnect', [func1], { wrapper: 'async', useNext: false })
        .registerPreHook('asyncConnect', [func2], { wrapper: 'async' });

      try {
        await network.asyncConnect();
      } catch (err) {
        expect(err).to.equal(error);
        errorThrown = true;
      }

      sinon.assert.calledOnce(func1);
      sinon.assert.notCalled(func2);
      sinon.assert.notCalled(connect);
      expect(errorThrown).to.be.true;
    });

    it('should catch and throw when running original method', async () => {
      let errorThrown = false;

      const asyncError = sinon.spy(network, 'asyncError');

      const func1 = sinon.spy(async ({ next }: NextParameters<Network>) => {
        expect(next).to.be.instanceOf(Next);
      });
      const func2 = sinon.spy(({ next }: NextParameters<Network>) => next.next());

      network
        .getSurrogate()
        .registerPreHook('asyncError', [func1], { wrapper: 'async', useNext: false })
        .registerPreHook('asyncError', [func2], { wrapper: 'sync' });

      try {
        await network.asyncError();
      } catch (err) {
        expect(err.message).to.equal('async error');
        errorThrown = true;
      }

      sinon.assert.calledOnce(func1);
      sinon.assert.calledOnce(func2);
      sinon.assert.calledOnce(asyncError);

      expect(errorThrown).to.be.true;
    });

    it('should throw error received from Next(POST) when using ASYNC wrapper', async () => {
      const error = new Error('fail');
      let errorThrown = false;

      const connect = sinon.spy(network, 'connect');

      const func1 = sinon.spy(({ next }: NextParameters<Network>) => {
        expect(next).to.be.instanceOf(Next);

        next.next({ error });
      });
      const func2 = sinon.spy(({ next }: NextParameters<Network>) => next.next());

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

      const func1 = sinon.spy(({ next }: NextParameters<Network>) => next.next());
      const func2 = sinon.spy(({ next }: NextParameters<Network>) => {
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

      const func1 = sinon.spy(({ next }: NextParameters<Network>) => {
        expect(next).to.be.instanceOf(Next);

        next.next({ error });
      });
      const func2 = sinon.spy(
        ({ next, instance, error: passedError }: NextParameters<Network>) => {
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
