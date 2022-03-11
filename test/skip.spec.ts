import { wrapSurrogate, Surrogate, NextParameters } from '../src';
import { Network } from './lib/network';
import * as sinon from 'sinon';

describe('Skip', () => {
  let network: Surrogate<Network>;
  let log: sinon.SinonStub<any, void>;

  beforeEach(() => {
    network = wrapSurrogate(new Network());
    log = sinon.stub(console, 'log');
    sinon.stub(console, 'error');
  });

  afterEach(() => {
    sinon.restore();
    network.disposeSurrogate();
  });

  it('should skip a single handler', () => {
    const func1 = sinon.spy(({ next }: NextParameters<Network>) => next.skipWith());
    const func2 = sinon.spy(({ next }: NextParameters<Network>) => next.next());
    const func3 = sinon.spy(({ next }: NextParameters<Network>) => next.next());

    network.getSurrogate().registerPreHook('connect', [func1, func2, func3]);
    network.connect();

    sinon.assert.calledOnce(func1);
    sinon.assert.notCalled(func2);
    sinon.assert.calledOnce(func3);
    sinon.assert.calledOnce(log);
  });

  it('should skip multiple handlers', () => {
    const func1 = sinon.spy(({ next }: NextParameters<Network>) => next.skip(2));
    const func2 = sinon.spy(({ next }: NextParameters<Network>) => next.next());
    const func3 = sinon.spy(({ next }: NextParameters<Network>) => next.next());
    const func4 = sinon.spy(({ next }: NextParameters<Network>) => next.next());

    network.getSurrogate().registerPreHook('connect', [func1, func2, func3, func4]);
    network.connect();

    sinon.assert.calledOnce(func1);
    sinon.assert.notCalled(func2);
    sinon.assert.notCalled(func3);
    sinon.assert.calledOnce(func4);
    sinon.assert.calledOnce(log);
  });

  it('should skip multiple handlers when called multiple times', () => {
    const func1 = sinon.spy(({ next }: NextParameters<Network>) => next.skip(2));
    const func2 = sinon.spy(({ next }: NextParameters<Network>) => next.next());
    const func3 = sinon.spy(({ next }: NextParameters<Network>) => next.next());
    const func4 = sinon.spy(({ next }: NextParameters<Network>) => next.next());

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
    const func1 = sinon.spy(({ next }: NextParameters<Network>) => next.next());
    const func2 = sinon.spy(({ next }: NextParameters<Network>) => next.skip(2));
    const func3 = sinon.spy(({ next }: NextParameters<Network>) => next.next());
    const func4 = sinon.spy(({ next }: NextParameters<Network>) => next.next());
    const func5 = sinon.spy(({ next }: NextParameters<Network>) => next.next());

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
    const func1 = sinon.spy(({ next }: NextParameters<Network>) => next.next());
    const func2 = sinon.spy(({ next }: NextParameters<Network>) => next.skip(20));
    const func3 = sinon.spy(({ next }: NextParameters<Network>) => next.next());
    const func4 = sinon.spy(({ next }: NextParameters<Network>) => next.next());

    network.getSurrogate().registerPreHook('connect', [func1, func2, func3, func4]);

    network.connect();

    sinon.assert.calledOnce(func1);
    sinon.assert.calledOnce(func2);
    sinon.assert.notCalled(func3);
    sinon.assert.notCalled(func4);
    sinon.assert.calledOnce(log);
  });

  it('should not skip post handlers when skipping pre handlers', () => {
    const func1 = sinon.spy(({ next }: NextParameters<Network>) => next.next());
    const func2 = sinon.spy(({ next }: NextParameters<Network>) => next.skip(20));
    const func3 = sinon.spy(({ next }: NextParameters<Network>) => next.next());
    const func4 = sinon.spy(({ next }: NextParameters<Network>) => next.next());
    const func5 = sinon.spy(({ next }: NextParameters<Network>) => next.next());

    const func6 = sinon.spy(({ next }: NextParameters<Network>) => next.next());
    const func7 = sinon.spy(({ next }: NextParameters<Network>) => next.next());
    const func8 = sinon.spy(({ next }: NextParameters<Network>) => next.next());
    const func9 = sinon.spy(({ next }: NextParameters<Network>) => next.next());

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
    const func1 = sinon.spy(({ next }: NextParameters<Network>) => next.next());
    const func2 = sinon.spy(({ next }: NextParameters<Network>) => next.skip(20));
    const func3 = sinon.spy(({ next }: NextParameters<Network>) => next.next());
    const func4 = sinon.spy(({ next }: NextParameters<Network>) => next.next());
    const func5 = sinon.spy(({ next }: NextParameters<Network>) => next.next());

    const func6 = sinon.spy(({ next }: NextParameters<Network>) => next.next());
    const func7 = sinon.spy(({ next }: NextParameters<Network>) => next.skip());
    const func8 = sinon.spy(({ next }: NextParameters<Network>) => next.next());
    const func9 = sinon.spy(({ next }: NextParameters<Network>) => next.next());

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
