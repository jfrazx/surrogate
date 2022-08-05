import { wrapSurrogate, Surrogate, NextParameters } from '../src';
import { Network } from './lib/network';
import { Next } from '../src/next';
import * as sinon from 'sinon';
import { expect } from 'chai';

describe('Next', () => {
  let network: Surrogate<Network>;
  const sandbox = sinon.createSandbox();

  let consoleError: sinon.SinonStub;

  beforeEach(() => {
    network = wrapSurrogate(new Network());
    consoleError = sandbox.stub(console, 'error');
    sandbox.stub(console, 'log');
  });

  afterEach(() => {
    sandbox.restore();
    network.disposeSurrogate();
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

      const func1 = sandbox.spy(({ next }: NextParameters<Network>) => {
        expect(next).to.be.instanceOf(Next);

        next.next({ error });
      });
      const func2 = sandbox.spy(({ next }: NextParameters<Network>) => next.next());

      network.getSurrogate().registerPreHook('connect', [func1, func2]);

      expect(() => network.connect()).to.throw(error.message);
      sandbox.assert.calledOnce(func1);
      sandbox.assert.notCalled(func2);
    });

    it('should throw an error on FinalNext(PRE)', () => {
      const error = new Error('fail');

      const func1 = sandbox.spy(({ next }: NextParameters<Network>) => next.next());
      const func2 = sandbox.spy(({ next }: NextParameters<Network>) => {
        next.next({ error });
      });

      network.getSurrogate().registerPreHook('connect', [func1, func2]);

      expect(() => network.connect()).to.throw(error.message);
      sandbox.assert.calledOnce(func1);
      sandbox.assert.calledOnce(func2);
    });

    it('should ignore error received from Next(PRE)', () => {
      const error = new Error('fail');

      const func1 = sandbox.spy(({ next }: NextParameters<Network>) => {
        expect(next).to.be.instanceOf(Next);

        next.next({ error });
      });
      const func2 = sandbox.spy(({ next, error: passedError }: NextParameters<Network>) => {
        expect(passedError).to.equal(error);

        next.next();
      });

      network
        .getSurrogate()
        .registerPreHook('connect', [func1, func2], { ignoreErrors: true });

      network.connect();

      sandbox.assert.calledOnce(func1);
      sandbox.assert.calledOnce(func2);
    });

    it('should throw error received from Next(POST)', () => {
      const error = new Error('fail');

      const func1 = sandbox.spy(({ next }: NextParameters<Network>) => {
        expect(next).to.be.instanceOf(Next);

        next.next({ error });
      });
      const func2 = sandbox.spy(({ next }: NextParameters<Network>) => next.next());

      network.getSurrogate().registerPostHook('connect', [func1, func2]);

      expect(() => network.connect()).to.throw(error.message);

      sandbox.assert.calledOnce(func1);
      sandbox.assert.notCalled(func2);
    });

    it('should catch and throw inside handler when using ASYNC wrapper and NOT using Next', async () => {
      const error = new Error('fail');
      let errorThrown = false;

      const connect = sandbox.spy(network, 'asyncConnect');

      const func1 = sandbox.spy(async ({ next }: NextParameters<Network>) => {
        expect(next).to.be.instanceOf(Next);

        throw error;
      });
      const func2 = sandbox.spy(({ next }: NextParameters<Network>) => next.next());

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

      sandbox.assert.calledOnce(func1);
      sandbox.assert.notCalled(func2);
      sandbox.assert.notCalled(connect);

      expect(errorThrown).to.be.true;
    });

    it('should catch and throw when running original method', async () => {
      let errorThrown = false;

      const asyncError = sandbox.spy(network, 'asyncError');

      const func1 = sandbox.spy(async ({ next }: NextParameters<Network>) => {
        expect(next).to.be.instanceOf(Next);
      });
      const func2 = sandbox.spy(({ next }: NextParameters<Network>) => next.next());

      network
        .getSurrogate()
        .registerPreHook('asyncError', [func1], { wrapper: 'async', useNext: false })
        .registerPreHook('asyncError', [func2], { wrapper: 'sync' });

      try {
        await network.asyncError();
      } catch (err: any) {
        expect(err.message).to.equal('async error');
        errorThrown = true;
      }

      sandbox.assert.calledOnce(func1);
      sandbox.assert.calledOnce(func2);
      sandbox.assert.calledOnce(asyncError);

      expect(errorThrown).to.be.true;
    });

    it('should throw error received from Next(POST) when using ASYNC wrapper', async () => {
      const error = new Error('fail');
      let errorThrown = false;

      const connect = sandbox.spy(network, 'connect');

      const func1 = sandbox.spy(({ next }: NextParameters<Network>) => {
        expect(next).to.be.instanceOf(Next);

        next.next({ error });
      });
      const func2 = sandbox.spy(({ next }: NextParameters<Network>) => next.next());

      network.getSurrogate().registerPostHook('connect', [func1, func2], { wrapper: 'async' });

      try {
        await network.connect();
      } catch {
        errorThrown = true;
      }
      sandbox.assert.calledOnce(connect);
      sandbox.assert.calledOnce(func1);
      sandbox.assert.notCalled(func2);
      expect(errorThrown).to.be.true;
    });

    it('should throw an error on FinalNext(POST)', () => {
      const error = new Error('fail');

      const func1 = sandbox.spy(({ next }: NextParameters<Network>) => next.next());
      const func2 = sandbox.spy(({ next }: NextParameters<Network>) => {
        next.next({ error });
      });

      network.getSurrogate().registerPostHook('connect', [func1, func2]);

      expect(() => network.connect()).to.throw(error.message);
      sandbox.assert.calledOnce(func1);
      sandbox.assert.calledOnce(func2);
    });

    it('should ignore error received from Next(POST)', () => {
      const error = new Error('fail');

      const func1 = sandbox.spy(({ next }: NextParameters<Network>) => {
        expect(next).to.be.instanceOf(Next);

        next.next({ error });
      });
      const func2 = sandbox.spy(
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

      sandbox.assert.calledOnce(func1);
      sandbox.assert.calledOnce(func2);
    });

    it(`should throw an error when async and next`, async () => {
      const error = new Error('fail');
      let errorThrown = false;

      const func1 = sandbox.spy((_nextParams) => {
        throw error;
      });
      const func2 = sandbox.spy(async ({ next }: NextParameters<Network>) => next.next());

      network
        .getSurrogate()
        .registerPostHook('asyncConnect', [func1, func2], { wrapper: 'async' });

      try {
        await network.asyncConnect();
      } catch (err) {
        expect(err).to.equal(error);
        errorThrown = true;
      }

      expect(errorThrown).to.be.true;
      sandbox.assert.calledOnce(func1);
      sandbox.assert.notCalled(func2);
    });
  });

  describe(`ErrorOutput`, () => {
    it('should output error received from Next(POST)', () => {
      const error = new Error('fail');

      const func1 = sandbox.spy(({ next }: NextParameters<Network>) => {
        expect(next).to.be.instanceOf(Next);

        next.next({ error });
      });

      network.getSurrogate().registerPostHook('connect', [func1]);

      sandbox.assert.notCalled(consoleError);
      sandbox.assert.notCalled(func1);

      expect(() => network.connect()).to.throw(error.message);

      sandbox.assert.calledOnce(func1);
      sandbox.assert.calledOnce(consoleError);
    });

    it('should NOT output error received from Next(POST)', () => {
      const error = new Error('fail');

      const func1 = sandbox.spy(({ next }: NextParameters<Network>) => {
        expect(next).to.be.instanceOf(Next);

        next.next({ error });
      });

      network.getSurrogate().registerPostHook('connect', [func1], { silenceErrors: true });

      sandbox.assert.notCalled(consoleError);
      sandbox.assert.notCalled(func1);

      expect(() => network.connect()).to.throw(error.message);

      sandbox.assert.calledOnce(func1);
      sandbox.assert.notCalled(consoleError);
    });

    it('should NOT output error received from Next(POST) global options', () => {
      const network = wrapSurrogate(new Network(), { silenceErrors: true });
      const error = new Error('fail');

      const func1 = sandbox.spy(({ next }: NextParameters<Network>) => {
        expect(next).to.be.instanceOf(Next);

        next.next({ error });
      });

      network.getSurrogate().registerPostHook('connect', [func1]);

      sandbox.assert.notCalled(consoleError);
      sandbox.assert.notCalled(func1);

      expect(() => network.connect()).to.throw(error.message);

      sandbox.assert.calledOnce(func1);
      sandbox.assert.notCalled(consoleError);
    });

    it('should output error received from Next(PRE) global options', () => {
      const network = wrapSurrogate(new Network(), { silenceErrors: true });
      const error = new Error('fail');

      const func1 = sandbox.spy(({ next }: NextParameters<Network>) => {
        expect(next).to.be.instanceOf(Next);

        next.next({ error });
      });

      network.getSurrogate().registerPreHook('connect', [func1], { silenceErrors: false });

      sandbox.assert.notCalled(consoleError);
      sandbox.assert.notCalled(func1);

      expect(() => network.connect()).to.throw(error.message);

      sandbox.assert.calledOnce(func1);
      sandbox.assert.calledOnce(consoleError);
    });

    it('should NOT output error received from Next(PRE) with a supplied function', () => {
      const network = wrapSurrogate(new Network(), { silenceErrors: true });
      const error = new Error('fail');

      const func1 = sandbox.spy(({ next }: NextParameters<Network>) => {
        expect(next).to.be.instanceOf(Next);

        next.next({ error });
      });

      network.getSurrogate().registerPreHook('connect', [func1], {
        silenceErrors: (error: Error) => error.message === 'fail',
      });

      sandbox.assert.notCalled(consoleError);
      sandbox.assert.notCalled(func1);

      expect(() => network.connect()).to.throw(error.message);

      sandbox.assert.calledOnce(func1);
      sandbox.assert.notCalled(consoleError);
    });

    it('should  output error received from Next(PRE) with a supplied function', () => {
      const network = wrapSurrogate(new Network(), { silenceErrors: true });
      const error = new Error('fail');

      const func1 = sandbox.spy(({ next }: NextParameters<Network>) => {
        expect(next).to.be.instanceOf(Next);

        next.next({ error });
      });

      network.getSurrogate().registerPreHook('connect', [func1], {
        silenceErrors: (error: Error) => error.message !== 'fail',
      });

      sandbox.assert.notCalled(consoleError);
      sandbox.assert.notCalled(func1);

      expect(() => network.connect()).to.throw(error.message);

      sandbox.assert.calledOnce(func1);
      sandbox.assert.calledOnce(consoleError);
    });
  });
});
