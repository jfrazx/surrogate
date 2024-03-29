import { wrapSurrogate, Surrogate, NextParameters } from '../src';
import { EventManager } from '../src/manager';
import { Network } from './lib/network';
import * as sinon from 'sinon';
import { expect } from 'chai';

describe('SurrogateProxy', () => {
  const sandbox = sinon.createSandbox();

  let log: sinon.SinonStub<any, void>;
  let clock: sinon.SinonFakeTimers;
  let network: Surrogate<Network>;

  after(() => {
    clock.restore();
  });

  beforeEach(() => {
    network = wrapSurrogate(new Network());
    log = sandbox.stub(console, 'log');
    clock = sandbox.useFakeTimers();
  });

  afterEach(() => {
    sandbox.restore();
    network.disposeSurrogate();
  });

  describe('General', () => {
    it('should transparently wrap objects', () => {
      expect(network).to.be.instanceof(Network);
    });

    it('should not wrap the same object twice', () => {
      expect(network).to.equal(wrapSurrogate(network));
    });
  });

  describe('Run', () => {
    it('should run twice', () => {
      const nextParameters = sinon.spy(({ next }: NextParameters<Network>) => next.next());

      network.getSurrogate().registerPreHook('connect', nextParameters);
      network.connect();

      sinon.assert.calledOnce(nextParameters);

      network.connect();

      sinon.assert.calledTwice(nextParameters);
    });

    it('should run twice without resetting context', () => {
      const nextParameters = sinon.spy(({ next }: NextParameters<Network>) => next.next());

      network.getSurrogate().registerPreHook('connect', nextParameters);
      network.connect();

      sinon.assert.calledOnce(nextParameters);

      network.connect();

      sinon.assert.calledTwice(nextParameters);
    });

    it('should run twice and dispose', () => {
      const nextParameters = sinon.spy(({ next }: NextParameters<Network>) => next.next());

      network.getSurrogate().registerPreHook('connect', nextParameters);
      network.connect();

      sinon.assert.calledOnce(nextParameters);

      network.connect();

      sinon.assert.calledTwice(nextParameters);

      const unwrapped = network.disposeSurrogate();

      unwrapped.connect();

      sinon.assert.calledTwice(nextParameters);

      network.connect();

      sinon.assert.calledTwice(nextParameters);

      expect((unwrapped as any).getSurrogate).to.be.undefined;
      expect((unwrapped as any).bypassSurrogate).to.be.undefined;
      expect((unwrapped as any).disposeSurrogate).to.be.undefined;

      expect(network.getSurrogate()).to.be.instanceOf(EventManager);
      expect(network.bypassSurrogate()).to.equal(unwrapped);
      expect(() => network.disposeSurrogate()).to.not.throw();
    });

    it('should run target method bypassing handlers', () => {
      const nextParameters = sinon.spy(({ next }: NextParameters<Network>) => next.next());
      const network = new Network();
      const connect = network.connect;

      const wrappedNetwork = wrapSurrogate(network);

      wrappedNetwork.getSurrogate().registerPreHook('connect', nextParameters);

      const bypassedConnect = wrappedNetwork.bypassSurrogate().connect;

      expect(connect).to.equal(bypassedConnect);

      wrappedNetwork.bypassSurrogate().connect();

      sinon.assert.notCalled(nextParameters);
    });

    it('should run detached', () => {
      const handler = sinon.spy(({ next }: NextParameters<Network>) => next.next());

      network.getSurrogate().registerPreHook('connect', handler);

      const { connect } = network;

      connect();
      connect();
      connect();
      connect();

      sinon.assert.callCount(handler, 4);
    });

    it('should wait for next to be called before continuing', async () => {
      const returnValue = 'ContinueTestResult';

      class ContinueTest {
        handler({ next }: NextParameters<ContinueTest>) {
          setTimeout(() => next.next(), 1000);

          clock.tick(1050);
        }

        async method() {
          return returnValue;
        }
      }

      const test = wrapSurrogate(new ContinueTest());

      test.getSurrogate().registerPreHook('method', test.handler);

      const start = Date.now();

      const result = await test.method();

      const end = Date.now();

      expect(result).to.equal(returnValue);
      expect(end - start).to.be.gte(1000);
    });

    it('should determine to ignore next when missing the option and no arguments', () => {
      const returnValue = 'NoNextParams';
      const handler1Log = 'Log 1 was called';
      const handler1 = sinon.spy(() => console.log(handler1Log));
      const handler2Log = 'Log 2 was called';
      const handler2 = sinon.spy(() => console.log(handler2Log));

      class NoNextTest {
        method() {
          return returnValue;
        }
      }

      const test = wrapSurrogate(new NoNextTest());

      test.getSurrogate().registerPreHook('method', [handler1, handler2], { noArgs: true });

      const result = test.method();

      expect(result).to.equal(returnValue);

      sinon.assert.calledWith(log, handler1Log);
      sinon.assert.calledWith(log, handler2Log);
      sinon.assert.calledOnce(handler1);
      sinon.assert.calledOnce(handler2);
    });
  });
});
