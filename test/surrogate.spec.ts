import { wrapSurrogate, Surrogate, NextHandler } from '../src';
import { Network } from './lib/network';
import * as sinon from 'sinon';
import { expect } from 'chai';

describe('SurrogateProxy', () => {
  let log: sinon.SinonStub<any, void>;
  let clock: sinon.SinonFakeTimers;
  let network: Surrogate<Network>;

  after(() => {
    clock.restore();
  });

  beforeEach(() => {
    network = wrapSurrogate(new Network());
    log = sinon.stub(console, 'log');
    clock = sinon.useFakeTimers();
  });

  afterEach(() => {
    sinon.restore();
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
      const nextHandler = sinon.spy(({ next }: NextHandler<Network>) => next.next());

      network.getSurrogate().registerPreHook('connect', nextHandler);
      network.connect();

      sinon.assert.calledOnce(nextHandler);

      network.connect();

      sinon.assert.calledTwice(nextHandler);
    });

    it('should run twice without resetting context', () => {
      const nextHandler = sinon.spy(({ next }: NextHandler<Network>) => next.next());

      network.getSurrogate().registerPreHook('connect', nextHandler);
      network.connect();

      sinon.assert.calledOnce(nextHandler);

      network.connect();

      sinon.assert.calledTwice(nextHandler);
    });

    it('should run twice and dispose', () => {
      const nextHandler = sinon.spy(({ next }: NextHandler<Network>) => next.next());

      network.getSurrogate().registerPreHook('connect', nextHandler);
      network.connect();

      sinon.assert.calledOnce(nextHandler);

      network.connect();

      sinon.assert.calledTwice(nextHandler);

      const unwrapped = network.disposeSurrogate();

      unwrapped.connect();

      sinon.assert.calledTwice(nextHandler);

      network.connect();

      sinon.assert.calledTwice(nextHandler);
    });

    it('should run target method bypassing handlers', () => {
      const nextHandler = sinon.spy(({ next }: NextHandler<Network>) => next.next());
      const network = new Network();
      const connect = network.connect;

      const wrappedNetwork = wrapSurrogate(network);

      wrappedNetwork.getSurrogate().registerPreHook('connect', nextHandler);

      const bypassedConnect = wrappedNetwork.bypassSurrogate().connect;

      expect(connect).to.equal(bypassedConnect);

      wrappedNetwork.bypassSurrogate().connect();

      sinon.assert.notCalled(nextHandler);
    });

    it('should run detached', () => {
      const nextHandler = sinon.spy(({ next }: NextHandler<Network>) => next.next());

      network.getSurrogate().registerPreHook('connect', nextHandler);

      const { connect } = network;

      connect();
      connect();
      connect();
      connect();

      sinon.assert.callCount(nextHandler, 4);
    });

    it('should wait for next to be called before continuing', async () => {
      const returnValue = 'ContinueTestResult';

      class ContinueTest {
        handler({ next }: NextHandler<ContinueTest>) {
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

    it('should determine to ignore next when missing the option and no parameters', () => {
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

      test.getSurrogate().registerPreHook('method', [handler1, handler2]);

      const result = test.method();

      expect(result).to.equal(returnValue);
      sinon.assert.calledWith(log, handler1Log);
      sinon.assert.calledWith(log, handler2Log);
      sinon.assert.called(handler1);
      sinon.assert.called(handler2);
    });
  });
});
