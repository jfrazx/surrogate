import { wrapSurrogate, Surrogate, NextParameters } from '../src';
import { Network } from './lib/network';
import * as sinon from 'sinon';
import { expect } from 'chai';

describe('Bail', () => {
  const sandbox = sinon.createSandbox();
  let network: Surrogate<Network>;

  beforeEach(() => {
    network = wrapSurrogate(new Network());
    sandbox.stub(console, 'error');
    sandbox.stub(console, 'log');
  });

  afterEach(() => {
    network.disposeSurrogate();
    sandbox.restore();
  });

  it('should exit early with bail skipping handlers', () => {
    const nextParameters = sandbox.spy(({ next }: NextParameters<Network>) => next.bail());
    const nextParameters2 = sandbox.spy(({ next }: NextParameters<Network>) => next.next());

    network.getSurrogate().registerPreHook('connect', [nextParameters, nextParameters2]);

    const connect = sandbox.spy(network.connect);

    network.connect();

    sandbox.assert.calledOnce(nextParameters);
    sandbox.assert.notCalled(nextParameters2);
    sandbox.assert.notCalled(connect);
  });

  it('should exit early with bail skipping main method', () => {
    const nextParameters = sandbox.spy(({ next }: NextParameters<Network>) => next.next());
    const nextParameters2 = sandbox.spy(({ next }: NextParameters<Network>) => next.bail());

    network.getSurrogate().registerPreHook('connect', [nextParameters, nextParameters2]);

    const connect = sandbox.spy(network.connect);

    network.connect();

    sandbox.assert.calledOnce(nextParameters);
    sandbox.assert.calledOnce(nextParameters2);
    sandbox.assert.notCalled(connect);
  });

  it('should ignore errors and exit early with bail skipping main method', () => {
    const nextParameters = sandbox.spy(({ next }: NextParameters<Network>) => next.next());
    const nextParameters2 = sandbox.spy(({ next }: NextParameters<Network>) =>
      next.bail({ error: new Error('ignore') }),
    );

    network
      .getSurrogate()
      .registerPreHook('connect', nextParameters)
      .registerPreHook('connect', nextParameters2, { ignoreErrors: true });

    const connect = sandbox.spy(network.connect);

    network.connect();

    sandbox.assert.calledOnce(nextParameters);
    sandbox.assert.calledOnce(nextParameters2);
    sandbox.assert.notCalled(connect);
  });

  it('should ignore errors and exit early with bailWith skipping main method ', () => {
    const nextParameters = sandbox.spy(({ next }: NextParameters<Network>) => next.next());
    const nextParameters2 = sandbox.spy(({ next }: NextParameters<Network>) =>
      next.bail({ error: new Error('ignore'), bailWith: 'bail' }),
    );

    network
      .getSurrogate()
      .registerPreHook('connect', nextParameters)
      .registerPreHook('connect', nextParameters2, { ignoreErrors: true });

    const connect = sandbox.spy(network.connect);

    const result = network.connect();

    sandbox.assert.calledOnce(nextParameters);
    sandbox.assert.calledOnce(nextParameters2);
    sandbox.assert.notCalled(connect);
    expect(result).to.equal('bail');
  });
});
