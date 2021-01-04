import { wrapSurrogate, Surrogate, INext } from '../src';
import { Network } from './lib/network';
import * as sinon from 'sinon';
import { expect } from 'chai';

describe('SurrogateProxy', () => {
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
    it('should transparently wrap objects', () => {
      expect(network).to.be.instanceof(Network);
    });
  });

  describe('Run', () => {
    it('should run twice', () => {
      const nextHandler = sinon.spy((next: INext<Network>) => next.next());

      network.getSurrogate().registerPreHook('connect', nextHandler);
      network.connect();

      sinon.assert.calledOnce(nextHandler);

      network.connect();

      sinon.assert.calledTwice(nextHandler);
    });

    it('should run twice without resetting context', () => {
      const nextHandler = sinon.spy((next: INext<Network>) => next.next());

      network.getSurrogate().registerPreHook('connect', nextHandler, {
        resetContext: false,
      });
      network.connect();

      sinon.assert.calledOnce(nextHandler);

      network.connect();

      sinon.assert.calledTwice(nextHandler);
    });

    it('should run twice without resetting context and dispose', () => {
      const nextHandler = sinon.spy((next: INext<Network>) => next.next());

      network.getSurrogate().registerPreHook('connect', nextHandler, {
        resetContext: false,
      });
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

    it('should run detached', () => {
      const nextHandler = sinon.spy((next: INext<Network>) => next.next());

      network.getSurrogate().registerPreHook('connect', nextHandler);
      const connect = network.connect;

      connect();
      connect();
      connect();
      connect();

      sinon.assert.callCount(nextHandler, 4);
    });
  });
});
