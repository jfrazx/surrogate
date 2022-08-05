import { Surrogate, wrapSurrogate, NextParameters } from '../src';
import { NextProvider } from '../src/provider/next';
import { Network } from './lib/network';
import * as sinon from 'sinon';
import { expect } from 'chai';

describe('NextParameters', () => {
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

  it('should be an instance of NextProvider', () => {
    const handler = sandbox.stub();

    network.getSurrogate().registerPostHook('connect', [handler], { useNext: false });

    network.connect();

    const [provider]: NextProvider<Network>[] = handler.getCall(0).args;

    expect(provider).to.be.instanceOf(NextProvider);
  });

  it('should pass NextParameters objects to handlers', () => {
    const func1 = sandbox.stub();
    const func2 = sandbox.stub();

    network.getSurrogate().registerPreHook('connect', [func1, func2], { useNext: false });
    network.connect();

    sandbox.assert.calledOnce(func1);
    sandbox.assert.calledOnce(func2);
    sandbox.assert.calledOnce(log);
  });

  it('should pass arguments from one handler to the next', () => {
    const func1 = sandbox.spy(({ next }: NextParameters<Network>) =>
      next.next({ using: [0, 1, 2, 3] }),
    );
    const func2 = sandbox.stub();

    network
      .getSurrogate()
      .registerPreHook('connect', [func1])
      .registerPreHook('connect', func2, { useNext: false });

    network.connect();

    expect(func1.calledImmediatelyBefore(func2)).to.be.true;
    expect(func2.calledImmediatelyAfter(func1)).to.be.true;

    const [{ receivedArgs }]: { [k: string]: number[] }[] = func2.getCall(0).args;

    receivedArgs.forEach((value, index) => {
      expect(value).to.be.a('number');
      expect(value).to.equal(index);
    });
  });

  it('should pass the current target method (action)', () => {
    const serverName = 'server name';
    const handler = sandbox.stub();

    network.getSurrogate().registerPreHook('checkServer', handler, {
      useNext: false,
    });

    network.checkServer(serverName);

    const [{ action }]: NextParameters<Network>[] = handler.getCall(0).args;

    expect(action).to.be.an('string');
    expect(action).to.equal('checkServer');
  });

  it('should pass the current hook', () => {
    const serverName = 'server name';
    const handler = sandbox.stub();

    network
      .getSurrogate()
      .registerPreHook('checkServer', [handler], { useNext: false })
      .registerPostHook('checkServer', handler, {
        useNext: false,
      });

    const name = network.checkServer(serverName);

    const [{ hookType: preHook }]: NextParameters<Network>[] = handler.getCall(0).args;
    const [{ hookType: postHook }]: NextParameters<Network>[] = handler.getCall(1).args;

    expect(name).to.equal(serverName);
    expect(preHook).to.be.a('string');
    expect(preHook).to.equal('pre');
    expect(postHook).to.be.a('string');
    expect(postHook).to.equal('post');
  });

  it('should pass the result', () => {
    const serverName = 'server name result';
    const handler = sandbox.stub();

    network
      .getSurrogate()
      .registerPreHook('checkServer', [handler], {
        useNext: false,
      })
      .registerPostHook('checkServer', handler, {
        useNext: false,
      });

    const name = network.checkServer(serverName);
    const [{ result: preResult }]: NextParameters<Network>[] = handler.getCall(0).args;
    const [{ result: postResult }]: NextParameters<Network>[] = handler.getCall(1).args;

    expect(name).to.equal(serverName);
    expect(preResult).to.be.undefined;
    expect(postResult).to.be.a('string');
    expect(postResult).to.equal(serverName);
  });
});
