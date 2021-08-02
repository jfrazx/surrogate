import { wrapSurrogate, Surrogate, NextParameters } from '../src';
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
    network.disposeSurrogate();
    sinon.restore();
  });

  it('should exit early with bail skipping handlers', () => {
    const nextParameters = sinon.spy(({ next }: NextParameters<Network>) =>
      next.next({ bail: true }),
    );
    const nextParameters2 = sinon.spy(({ next }: NextParameters<Network>) => next.next());

    network.getSurrogate().registerPreHook('connect', [nextParameters, nextParameters2]);

    const connect = sinon.spy(network.connect);

    network.connect();

    sinon.assert.calledOnce(nextParameters);
    sinon.assert.notCalled(nextParameters2);
    sinon.assert.notCalled(connect);
  });

  it('should exit early with bail skipping main method', () => {
    const nextParameters = sinon.spy(({ next }: NextParameters<Network>) => next.next());
    const nextParameters2 = sinon.spy(({ next }: NextParameters<Network>) =>
      next.next({ bail: true }),
    );

    network.getSurrogate().registerPreHook('connect', [nextParameters, nextParameters2]);

    const connect = sinon.spy(network.connect);

    network.connect();

    sinon.assert.calledOnce(nextParameters);
    sinon.assert.calledOnce(nextParameters2);
    sinon.assert.notCalled(connect);
  });

  it('should ignore errors and exit early with bail skipping main method', () => {
    const nextParameters = sinon.spy(({ next }: NextParameters<Network>) => next.next());
    const nextParameters2 = sinon.spy(({ next }: NextParameters<Network>) =>
      next.next({ bail: true, error: new Error('ignore') }),
    );

    network
      .getSurrogate()
      .registerPreHook('connect', nextParameters)
      .registerPreHook('connect', nextParameters2, { ignoreErrors: true });

    const connect = sinon.spy(network.connect);

    network.connect();

    sinon.assert.calledOnce(nextParameters);
    sinon.assert.calledOnce(nextParameters2);
    sinon.assert.notCalled(connect);
  });

  it('should ignore errors and exit early with bailWith skipping main method ', () => {
    const nextParameters = sinon.spy(({ next }: NextParameters<Network>) => next.next());
    const nextParameters2 = sinon.spy(({ next }: NextParameters<Network>) =>
      next.next({ bail: true, error: new Error('ignore'), bailWith: 'bail' }),
    );

    network
      .getSurrogate()
      .registerPreHook('connect', nextParameters)
      .registerPreHook('connect', nextParameters2, { ignoreErrors: true });

    const connect = sinon.spy(network.connect);

    const result = network.connect();

    sinon.assert.calledOnce(nextParameters);
    sinon.assert.calledOnce(nextParameters2);
    sinon.assert.notCalled(connect);
    expect(result).to.equal('bail');
  });
});
