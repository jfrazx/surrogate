import { ErrorProvider, BailProvider } from '../src/provider';
import { Surrogate, wrapSurrogate, RunOnErrorParameters, RunOnBailParameters } from '../src';
import { Network } from './lib/network';
import * as sinon from 'sinon';
import { expect } from 'chai';

describe(`RunOn`, () => {
  let network: Surrogate<Network>;

  beforeEach(() => {
    network = wrapSurrogate(new Network());
    sinon.stub(console, 'error');
    sinon.stub(console, 'log');
  });

  afterEach(() => {
    network.disposeSurrogate();
    sinon.restore();
  });

  describe(`Error`, () => {
    it(`should accept runOnError function in handler options`, () => {
      const handler = sinon.stub();
      const runner = sinon.stub();

      network.getSurrogate().registerPreHook('connect', handler, {
        runOnError: runner,
      });
    });

    it('should run when an error occurs', () => {
      const runner = sinon.stub();
      const handler = sinon.spy(() => {
        throw new Error('error');
      });

      network.getSurrogate().registerPreHook('connect', handler, {
        runOnError: runner,
        useNext: false,
      });

      expect(() => network.connect()).to.throw();

      expect(runner.called).to.be.true;

      const [provider]: ErrorProvider<Network>[] = runner.getCall(0).args;

      expect(provider).to.be.instanceOf(ErrorProvider);
    });

    it('should run multiple when an error occurs', () => {
      const runner1 = sinon.stub();
      const runner2 = sinon.stub();
      const handler = sinon.spy(() => {
        throw new Error('error');
      });

      network.getSurrogate().registerPreHook('connect', handler, {
        runOnError: [runner1, runner2],
        useNext: false,
      });

      expect(() => network.connect()).to.throw();

      expect(runner1.called).to.be.true;
      expect(runner2.called).to.be.true;

      const [provider1]: ErrorProvider<Network>[] = runner1.getCall(0).args;
      const [provider2]: ErrorProvider<Network>[] = runner2.getCall(0).args;

      expect(provider1).to.be.instanceOf(ErrorProvider);
      expect(provider2).to.be.instanceOf(ErrorProvider);
      expect(provider1).to.equal(provider2);
    });

    it(`should ignore errors`, () => {
      const runner = sinon.stub();
      const handler = sinon.spy(() => {
        throw new Error('error');
      });

      network.getSurrogate().registerPreHook('connect', handler, {
        runOnError: runner,
        ignoreErrors: true,
        useNext: true,
      });

      expect(() => network.connect()).to.not.throw();

      expect(runner.called).to.be.true;
    });

    it(`should recover from errors`, () => {
      const runner = sinon.spy((provider: RunOnErrorParameters<any>) =>
        provider.recoverFromError(true),
      );
      const handler = sinon.spy(() => {
        throw new Error('error');
      });

      network.getSurrogate().registerPreHook('connect', handler, {
        runOnError: [runner],
        useNext: true,
      });

      expect(() => network.connect()).to.not.throw();

      expect(runner.called).to.be.true;
    });

    it(`should stay recovered from errors`, () => {
      const runner1 = sinon.spy((provider: RunOnErrorParameters<any>) =>
        provider.recoverFromError(true),
      );
      const runner2 = sinon.spy((provider: RunOnErrorParameters<any>) =>
        provider.recoverFromError(false),
      );
      const handler = sinon.spy(() => {
        throw new Error('error');
      });

      network.getSurrogate().registerPreHook('connect', handler, {
        runOnError: [runner1, runner2],
        useNext: true,
      });

      expect(() => network.connect()).to.not.throw();

      expect(runner1.called).to.be.true;
      expect(runner2.called).to.be.true;
    });
    it(`should recover then fail`, () => {
      const runner1 = sinon.spy((provider: RunOnErrorParameters<any>) =>
        provider.recoverFromError(true),
      );
      const runner2 = sinon.spy((provider: RunOnErrorParameters<any>) =>
        provider.recoverFromError(false),
      );
      const handler1 = sinon.spy(() => {
        throw new Error('error');
      });
      const handler2 = sinon.spy(() => {
        throw new Error('error');
      });

      network
        .getSurrogate()
        .registerPreHook('connect', handler1, {
          runOnError: [runner1, runner2],
        })
        .registerPreHook('connect', handler2, { useNext: false });

      expect(() => network.connect()).to.throw();

      expect(handler1.called).to.be.true;
      expect(handler2.called).to.be.true;
      expect(runner1.called).to.be.true;
      expect(runner2.called).to.be.true;
    });
  });

  describe(`Bail`, () => {
    it(`should accept runOnBail function in handler options`, () => {
      const handler = sinon.stub();
      const bailRunner = sinon.stub();

      network.getSurrogate().registerPreHook('connect', handler, {
        runOnBail: bailRunner,
      });
    });

    it('should run on bail', () => {
      const runner = sinon.stub();
      const handler = sinon.spy(({ next }) => next.next({ bail: true }));

      network.getSurrogate().registerPreHook('connect', handler, {
        runOnBail: runner,
      });

      network.connect();

      expect(runner.called).to.be.true;

      const [provider]: BailProvider<Network>[] = runner.getCall(0).args;

      expect(provider).to.be.instanceOf(BailProvider);
    });

    it('should run multiple when bail occurs', () => {
      const runner1 = sinon.stub();
      const runner2 = sinon.stub();
      const handler = sinon.spy(({ next }) => next.next({ bail: true }));

      network.getSurrogate().registerPreHook('connect', handler, {
        runOnBail: [runner1, runner2],
      });

      network.connect();

      expect(runner1.called).to.be.true;
      expect(runner2.called).to.be.true;

      const [provider1]: BailProvider<Network>[] = runner1.getCall(0).args;
      const [provider2]: BailProvider<Network>[] = runner2.getCall(0).args;

      expect(provider1).to.be.instanceOf(BailProvider);
      expect(provider2).to.be.instanceOf(BailProvider);
      expect(provider1).to.equal(provider2);
    });

    it(`should recover from bail`, () => {
      const runner = sinon.spy((provider: RunOnBailParameters<any>) =>
        provider.recoverFromBail(true),
      );
      const handler1 = sinon.spy(({ next }) => next.next({ bail: true }));
      const handler2 = sinon.stub();

      network
        .getSurrogate()
        .registerPreHook('connect', [handler1], {
          runOnBail: [runner],
        })
        .registerPreHook('connect', handler2, {
          useNext: false,
        });

      network.connect();

      expect(runner.called).to.be.true;
      expect(handler1.called).to.be.true;
      expect(handler2.called).to.be.true;
    });

    it(`should stay recovered from bail`, () => {
      const runner1 = sinon.spy((provider: RunOnBailParameters<any>) =>
        provider.recoverFromBail(true),
      );
      const runner2 = sinon.spy((provider: RunOnBailParameters<any>) =>
        provider.recoverFromBail(false),
      );
      const handler1 = sinon.spy(({ next }) => next.next({ bail: true }));
      const handler2 = sinon.stub();

      network
        .getSurrogate()
        .registerPreHook('connect', [handler1], {
          runOnBail: [runner1, runner2],
        })
        .registerPreHook('connect', handler2, {
          useNext: false,
        });

      network.connect();

      expect(runner1.called).to.be.true;
      expect(runner2.called).to.be.true;
      expect(handler1.called).to.be.true;
      expect(handler2.called).to.be.true;
    });

    it(`should bailWith value from a handler`, () => {
      const bailWith = 'bailWith';
      const handler = sinon.spy(({ next }) => next.next({ bail: true, bailWith }));
      const handler2 = sinon.stub();

      network
        .getSurrogate()
        .registerPreHook('connect', handler, {
          runOnBail: [],
        })
        .registerPreHook('connect', handler2, {
          useNext: false,
        });

      const result = network.connect();

      expect(handler.called).to.be.true;
      expect(handler2.called).to.be.false;
      expect(result).to.equal(bailWith);
    });

    it(`should bailWith value from a bail runner`, () => {
      const bailWith = 'bailWith';
      const bailOverride = 'bailOverride';

      const handler = sinon.spy(({ next }) => next.next({ bail: true, bailWith }));
      const runner = sinon.spy((provider: RunOnBailParameters<any>) =>
        provider.bailWith(bailOverride),
      );
      const handler2 = sinon.stub();

      network
        .getSurrogate()
        .registerPreHook('connect', handler, {
          runOnBail: [runner],
        })
        .registerPreHook('connect', handler2, {
          useNext: false,
        });

      const result = network.connect();

      expect(handler.called).to.be.true;
      expect(handler2.called).to.be.false;
      expect(result).to.not.equal(bailWith);
      expect(result).to.equal(bailOverride);
    });

    it(`should bail with the last runner provided value`, () => {
      const bailWith = 'bailWith';
      const bailOverride = 'bailOverride';
      const bailOverrideOverride = 'bailOverrideOverride';

      const handler = sinon.spy(({ next }) => next.next({ bail: true, bailWith }));
      const handler2 = sinon.stub();

      const runner1 = sinon.spy((provider: RunOnBailParameters<any>) =>
        provider.bailWith(bailOverride),
      );
      const runner2 = sinon.spy((provider: RunOnBailParameters<any>) =>
        provider.bailWith(bailOverrideOverride),
      );

      network
        .getSurrogate()
        .registerPreHook('connect', handler, {
          runOnBail: [runner1, runner2],
        })
        .registerPreHook('connect', handler2, {
          useNext: false,
        });

      const result = network.connect();

      expect(handler.called).to.be.true;
      expect(handler2.called).to.be.false;
      expect(result).to.not.equal(bailWith);
      expect(result).to.not.equal(bailOverride);
      expect(result).to.equal(bailOverrideOverride);
    });

    it(`should not call runOnBail with error interrupt`, () => {
      const errorRunner = sinon.stub();
      const bailRunner = sinon.stub();
      const handler = sinon.spy(({ next }) =>
        next.next({ error: new Error('error'), bail: true }),
      );

      network.getSurrogate().registerPreHook('connect', handler, {
        runOnError: errorRunner,
        runOnBail: bailRunner,
      });

      expect(() => network.connect()).to.throw();

      expect(errorRunner.called).to.be.true;
      expect(bailRunner.called).to.be.false;
      expect(handler.called).to.be.true;
    });

    it(`should recover from error then bail`, () => {
      const errorRunner = sinon.stub();
      const bailRunner = sinon.stub();
      const handler = sinon.spy(({ next }) =>
        next.next({ error: new Error('error'), bail: true }),
      );

      const connect = sinon.stub(network, 'connect');

      network.getSurrogate().registerPreHook('connect', handler, {
        runOnError: errorRunner,
        runOnBail: bailRunner,
        ignoreErrors: true,
      });

      expect(() => network.connect()).to.not.throw();

      expect(errorRunner.called).to.be.true;
      expect(bailRunner.called).to.be.true;
      expect(connect.called).to.be.false;
      expect(handler.called).to.be.true;
    });
  });
});
