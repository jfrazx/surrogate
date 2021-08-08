import { Network } from './lib/network';
import * as sinon from 'sinon';
import { expect } from 'chai';
import { Surrogate, wrapSurrogate } from '../src/';

describe(`Provide`, () => {
  let network: Surrogate<Network>;

  beforeEach(() => {
    network = wrapSurrogate(new Network());

    sinon.stub(console, 'error');
    sinon.stub(console, 'log');
  });

  afterEach(() => {
    sinon.restore();
    network.disposeSurrogate();
  });

  it(`should provide handlers user designated values`, () => {
    const handler = sinon.stub();
    const provide = { test: 'test' };

    network.getSurrogate().registerPreHook('connect', handler, {
      useNext: false,
      provide,
    });

    network.connect();

    const provider = handler.getCall(0).firstArg;

    expect(handler.calledOnce).to.be.true;
    expect(provider.provide).to.be.an('object');
    expect(provider.provide).to.equal(provide);
    expect(provider.provide).to.have.property('test', 'test');
  });

  it(`should provide handlers user designated values from global options`, () => {
    const provide = { test: 'test' };
    const handler = sinon.stub();

    const network = wrapSurrogate(new Network(), { provide });

    network.getSurrogate().registerPreHook('connect', handler, {
      useNext: false,
    });

    network.connect();

    const provider = handler.getCall(0).firstArg;

    expect(handler.calledOnce).to.be.true;
    expect(provider.provide).to.be.an('object');
    expect(provider.provide).to.equal(provide);
    expect(provider.provide).to.have.property('test', 'test');
  });

  it(`should utilize handler designated values over global`, () => {
    const provide1 = { test: 'test1' };
    const provide2 = { test: 'test2' };
    const handler = sinon.stub();

    const network = wrapSurrogate(new Network(), { provide: provide1 });

    network.getSurrogate().registerPreHook('connect', handler, {
      useNext: false,
      provide: provide2,
    });

    network.connect();

    const provider = handler.getCall(0).firstArg;

    expect(handler.calledOnce).to.be.true;
    expect(provider.provide).to.be.an('object');
    expect(provider.provide).to.equal(provide2);
    expect(provider.provide).to.have.property('test', 'test2');
  });

  it(`should provide conditionals user designated values`, () => {
    const runConditions = sinon.stub().returns(true);
    const provide = { test: 'test' };
    const handler = sinon.stub();

    network.getSurrogate().registerPreHook('connect', handler, {
      useNext: false,
      runConditions,
      provide,
    });

    network.connect();

    const provider = handler.getCall(0).firstArg;

    expect(handler.calledOnce).to.be.true;
    expect(provider.provide).to.be.an('object');
    expect(provider.provide).to.equal(provide);
    expect(provider.provide).to.have.property('test', 'test');

    const runProvider = runConditions.getCall(0).firstArg;

    expect(runConditions.calledOnce).to.be.true;
    expect(runProvider.provide).to.be.an('object');
    expect(runProvider.provide).to.equal(provide);
    expect(runProvider.provide).to.have.property('test', 'test');
  });
});
