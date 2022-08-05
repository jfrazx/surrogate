import { wrapSurrogate, Surrogate, NextParameters } from '../src';
import { Network } from './lib/network';
import * as sinon from 'sinon';

describe('Skip', () => {
  const sandbox = sinon.createSandbox();

  let network: Surrogate<Network>;
  let log: sinon.SinonStub<any, void>;

  beforeEach(() => {
    network = wrapSurrogate(new Network());
    log = sandbox.stub(console, 'log');
    sandbox.stub(console, 'error');
  });

  afterEach(() => {
    sandbox.restore();
    network.disposeSurrogate();
  });

  it('should skip a single handler', () => {
    const func1 = sandbox.spy(({ next }: NextParameters<Network>) => next.skipWith());
    const func2 = sandbox.spy(({ next }: NextParameters<Network>) => next.next());
    const func3 = sandbox.spy(({ next }: NextParameters<Network>) => next.next());

    network.getSurrogate().registerPreHook('connect', [func1, func2, func3]);
    network.connect();

    sandbox.assert.calledOnce(func1);
    sandbox.assert.notCalled(func2);
    sandbox.assert.calledOnce(func3);
    sandbox.assert.calledOnce(log);
  });

  it('should skip multiple handlers', () => {
    const func1 = sandbox.spy(({ next }: NextParameters<Network>) => next.skip(2));
    const func2 = sandbox.spy(({ next }: NextParameters<Network>) => next.next());
    const func3 = sandbox.spy(({ next }: NextParameters<Network>) => next.next());
    const func4 = sandbox.spy(({ next }: NextParameters<Network>) => next.next());

    network.getSurrogate().registerPreHook('connect', [func1, func2, func3, func4]);
    network.connect();

    sandbox.assert.calledOnce(func1);
    sandbox.assert.notCalled(func2);
    sandbox.assert.notCalled(func3);
    sandbox.assert.calledOnce(func4);
    sandbox.assert.calledOnce(log);
  });

  it('should skip multiple handlers when called multiple times', () => {
    const func1 = sandbox.spy(({ next }: NextParameters<Network>) => next.skip(2));
    const func2 = sandbox.spy(({ next }: NextParameters<Network>) => next.next());
    const func3 = sandbox.spy(({ next }: NextParameters<Network>) => next.next());
    const func4 = sandbox.spy(({ next }: NextParameters<Network>) => next.next());

    network.getSurrogate().registerPreHook('connect', [func1, func2, func3, func4]);
    network.connect();
    network.connect();

    sandbox.assert.callCount(func1, 2);
    sandbox.assert.notCalled(func2);
    sandbox.assert.notCalled(func3);
    sandbox.assert.callCount(func4, 2);
    sandbox.assert.callCount(log, 2);
  });

  it('should skip and the resume the next chain', () => {
    const func1 = sandbox.spy(({ next }: NextParameters<Network>) => next.next());
    const func2 = sandbox.spy(({ next }: NextParameters<Network>) => next.skip(2));
    const func3 = sandbox.spy(({ next }: NextParameters<Network>) => next.next());
    const func4 = sandbox.spy(({ next }: NextParameters<Network>) => next.next());
    const func5 = sandbox.spy(({ next }: NextParameters<Network>) => next.next());

    network.getSurrogate().registerPreHook('connect', [func1, func2, func3, func4, func5]);
    network.connect();

    sandbox.assert.calledOnce(func1);
    sandbox.assert.calledOnce(func2);
    sandbox.assert.notCalled(func3);
    sandbox.assert.notCalled(func4);
    sandbox.assert.calledOnce(func5);
    sandbox.assert.calledOnce(log);
  });

  it('should not skip the calling method', () => {
    const func1 = sandbox.spy(({ next }: NextParameters<Network>) => next.next());
    const func2 = sandbox.spy(({ next }: NextParameters<Network>) => next.skip(20));
    const func3 = sandbox.spy(({ next }: NextParameters<Network>) => next.next());
    const func4 = sandbox.spy(({ next }: NextParameters<Network>) => next.next());

    network.getSurrogate().registerPreHook('connect', [func1, func2, func3, func4]);

    network.connect();

    sandbox.assert.calledOnce(func1);
    sandbox.assert.calledOnce(func2);
    sandbox.assert.notCalled(func3);
    sandbox.assert.notCalled(func4);
    sandbox.assert.calledOnce(log);
  });

  it('should not skip post handlers when skipping pre handlers', () => {
    const func1 = sandbox.spy(({ next }: NextParameters<Network>) => next.next());
    const func2 = sandbox.spy(({ next }: NextParameters<Network>) => next.skip(20));
    const func3 = sandbox.spy(({ next }: NextParameters<Network>) => next.next());
    const func4 = sandbox.spy(({ next }: NextParameters<Network>) => next.next());
    const func5 = sandbox.spy(({ next }: NextParameters<Network>) => next.next());

    const func6 = sandbox.spy(({ next }: NextParameters<Network>) => next.next());
    const func7 = sandbox.spy(({ next }: NextParameters<Network>) => next.next());
    const func8 = sandbox.spy(({ next }: NextParameters<Network>) => next.next());
    const func9 = sandbox.spy(({ next }: NextParameters<Network>) => next.next());

    network
      .getSurrogate()
      .registerPreHook('connect', [func1, func2, func3, func4, func5])
      .registerPostHook('connect', [func6, func7, func8, func9]);

    network.connect();

    sandbox.assert.calledOnce(func1);
    sandbox.assert.calledOnce(func2);
    sandbox.assert.notCalled(func3);
    sandbox.assert.notCalled(func4);
    sandbox.assert.notCalled(func5);
    sandbox.assert.calledOnce(log);
    sandbox.assert.calledOnce(func6);
    sandbox.assert.calledOnce(func7);
    sandbox.assert.calledOnce(func8);
    sandbox.assert.calledOnce(func9);
  });

  it('should skip pre and post handlers', () => {
    const func1 = sandbox.spy(({ next }: NextParameters<Network>) => next.next());
    const func2 = sandbox.spy(({ next }: NextParameters<Network>) => next.skip(20));
    const func3 = sandbox.spy(({ next }: NextParameters<Network>) => next.next());
    const func4 = sandbox.spy(({ next }: NextParameters<Network>) => next.next());
    const func5 = sandbox.spy(({ next }: NextParameters<Network>) => next.next());

    const func6 = sandbox.spy(({ next }: NextParameters<Network>) => next.next());
    const func7 = sandbox.spy(({ next }: NextParameters<Network>) => next.skip());
    const func8 = sandbox.spy(({ next }: NextParameters<Network>) => next.next());
    const func9 = sandbox.spy(({ next }: NextParameters<Network>) => next.next());

    network
      .getSurrogate()
      .registerPreHook('connect', [func1, func2, func3, func4, func5])
      .registerPostHook('connect', [func6, func7, func8, func9]);

    network.connect();

    sandbox.assert.calledOnce(func1);
    sandbox.assert.calledOnce(func2);
    sandbox.assert.notCalled(func3);
    sandbox.assert.notCalled(func4);
    sandbox.assert.notCalled(func5);
    sandbox.assert.calledOnce(log);
    sandbox.assert.calledOnce(func6);
    sandbox.assert.calledOnce(func7);
    sandbox.assert.notCalled(func8);
    sandbox.assert.calledOnce(func9);
  });
});
