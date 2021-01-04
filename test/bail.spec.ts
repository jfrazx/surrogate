import { wrapSurrogate, Surrogate, INext } from '../src';
import { Network } from './lib/network';
import * as sinon from 'sinon';
import { expect } from 'chai';

describe('Bail', () => {
  let network: Surrogate<Network>;

  beforeEach(() => {
    network = wrapSurrogate(new Network());
    sinon.stub(console, 'error');
    sinon.stub(console, 'log');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should exit early with bail skipping handlers', () => {
    const nextHandler = sinon.spy((next: INext<Network>) => next.next({ bail: true }));
    const nextHandler2 = sinon.spy((next: INext<Network>) => next.next());

    network
      .getSurrogate()
      .registerPreHook('connect', nextHandler, {
        resetContext: false,
      })
      .registerPreHook('connect', nextHandler2);

    const connect = sinon.spy(network.connect);

    network.connect();

    sinon.assert.calledOnce(nextHandler);
    sinon.assert.notCalled(nextHandler2);
    sinon.assert.notCalled(connect);
  });

  it('should exit early with bail skipping main method', () => {
    const nextHandler = sinon.spy((next: INext<Network>) => next.next());
    const nextHandler2 = sinon.spy((next: INext<Network>) => next.next({ bail: true }));

    network
      .getSurrogate()
      .registerPreHook('connect', nextHandler, {
        resetContext: false,
      })
      .registerPreHook('connect', nextHandler2);

    const connect = sinon.spy(network.connect);

    network.connect();

    sinon.assert.calledOnce(nextHandler);
    sinon.assert.calledOnce(nextHandler2);
    sinon.assert.notCalled(connect);
  });

  it('should ignore errors and exit early with bail skipping main method', () => {
    const nextHandler = sinon.spy((next: INext<Network>) => next.next());
    const nextHandler2 = sinon.spy((next: INext<Network>) =>
      next.next({ bail: true, error: new Error('ignore') }),
    );

    network
      .getSurrogate()
      .registerPreHook('connect', nextHandler)
      .registerPreHook('connect', nextHandler2, { ignoreErrors: true });

    const connect = sinon.spy(network.connect);

    network.connect();

    sinon.assert.calledOnce(nextHandler);
    sinon.assert.calledOnce(nextHandler2);
    sinon.assert.notCalled(connect);
  });

  it('should ignore errors and exit early with bailWith skipping main method ', () => {
    const nextHandler = sinon.spy((next: INext<Network>) => next.next());
    const nextHandler2 = sinon.spy((next: INext<Network>) =>
      next.next({ bail: true, error: new Error('ignore'), bailWith: 'bail' }),
    );

    network
      .getSurrogate()
      .registerPreHook('connect', nextHandler)
      .registerPreHook('connect', nextHandler2, { ignoreErrors: true });

    const connect = sinon.spy(network.connect);

    const result = network.connect();

    sinon.assert.calledOnce(nextHandler);
    sinon.assert.calledOnce(nextHandler2);
    sinon.assert.notCalled(connect);
    expect(result).to.equal('bail');
  });
});
