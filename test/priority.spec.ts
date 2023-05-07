import type { SurrogateHandlerContainer } from '../src/containers';
import { wrapSurrogate, Surrogate } from '../src';
import { Network } from './lib/network';
import * as sinon from 'sinon';
import { expect } from 'chai';

describe(`PrioritySorting`, () => {
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

  it(`should accept 'priority' in handler options`, () => {
    const handler = sandbox.stub();

    network.getSurrogate().registerPreHook('connect', handler, { priority: 1 });
  });

  it(`should run pre handlers in the order of their priority`, () => {
    const handler1 = sandbox.stub();
    const handler2 = sandbox.stub();
    const handler3 = sandbox.stub();

    const eventHandlers: SurrogateHandlerContainer<Network>[] = network
      .getSurrogate()
      .registerPreHook('connect', handler3, { priority: 3, useNext: false })
      .registerPreHook('connect', handler1, { priority: 1, useNext: false })
      .registerPreHook('connect', handler2, { priority: 2, useNext: false })
      .getPreEventHandlers('connect');

    expect(eventHandlers).to.have.lengthOf(3);
    expect(eventHandlers[0].handler).to.equal(handler3);
    expect(eventHandlers[1].handler).to.equal(handler1);
    expect(eventHandlers[2].handler).to.equal(handler2);

    network.connect();

    expect(handler1.calledOnce).to.be.true;
    expect(handler2.calledOnce).to.be.true;
    expect(handler3.calledOnce).to.be.true;

    expect(handler1.calledBefore(handler2)).to.be.false;
    expect(handler2.calledBefore(handler3)).to.be.false;
    expect(handler3.calledBefore(handler1)).to.be.true;
    expect(handler2.calledBefore(handler1)).to.be.true;
  });

  it(`should run post handlers in the order of their priority`, () => {
    const handler1 = sandbox.stub();
    const handler2 = sandbox.stub();
    const handler3 = sandbox.stub();

    const eventHandlers: SurrogateHandlerContainer<Network>[] = network
      .getSurrogate()
      .registerPostHook('connect', handler3, { priority: 3, useNext: false })
      .registerPostHook('connect', handler1, { priority: 1, useNext: false })
      .registerPostHook('connect', handler2, { priority: 2, useNext: false })
      .getPostEventHandlers('connect');

    expect(eventHandlers).to.have.lengthOf(3);
    expect(eventHandlers[0].handler).to.equal(handler3);
    expect(eventHandlers[1].handler).to.equal(handler1);
    expect(eventHandlers[2].handler).to.equal(handler2);

    network.connect();

    expect(handler1.calledOnce).to.be.true;
    expect(handler2.calledOnce).to.be.true;
    expect(handler3.calledOnce).to.be.true;

    expect(handler1.calledBefore(handler2)).to.be.false;
    expect(handler2.calledBefore(handler3)).to.be.false;
    expect(handler3.calledBefore(handler1)).to.be.true;
    expect(handler2.calledBefore(handler1)).to.be.true;
  });

  it(`should run lower priority handlers last`, () => {
    const handler1 = sandbox.stub();
    const handler2 = sandbox.stub();
    const handler3 = sandbox.stub();
    const handler4 = sandbox.stub();

    network
      .getSurrogate()
      .registerPreHook('connect', handler4, { priority: 4, useNext: false })
      .registerPreHook('connect', handler2, { priority: -2, useNext: false })
      .registerPreHook('connect', handler3, { priority: -100, useNext: false })
      .registerPreHook('connect', handler1, { priority: -1, useNext: false });

    network.connect();

    expect(handler1.calledOnce).to.be.true;
    expect(handler2.calledOnce).to.be.true;
    expect(handler3.calledOnce).to.be.true;
    expect(handler4.calledOnce).to.be.true;

    expect(handler1.calledBefore(handler2)).to.be.true;
    expect(handler1.calledBefore(handler3)).to.be.true;
    expect(handler1.calledBefore(handler4)).to.be.false;
    expect(handler1.calledImmediatelyBefore(handler2)).to.be.true;
    expect(handler1.calledImmediatelyAfter(handler4)).to.be.true;

    expect(handler2.calledBefore(handler1)).to.be.false;
    expect(handler2.calledBefore(handler3)).to.be.true;
    expect(handler2.calledBefore(handler4)).to.be.false;
    expect(handler2.calledImmediatelyAfter(handler1)).to.be.true;
    expect(handler2.calledImmediatelyBefore(handler3)).to.be.true;

    expect(handler3.calledBefore(handler1)).to.be.false;
    expect(handler3.calledBefore(handler2)).to.be.false;
    expect(handler3.calledBefore(handler4)).to.be.false;
    expect(handler3.calledImmediatelyAfter(handler2)).to.be.true;

    expect(handler4.calledBefore(handler1)).to.be.true;
    expect(handler4.calledBefore(handler2)).to.be.true;
    expect(handler4.calledBefore(handler3)).to.be.true;
    expect(handler4.calledImmediatelyBefore(handler1)).to.be.true;
  });

  it(`should run higher priority handlers first`, () => {
    const handler1 = sandbox.stub();
    const handler2 = sandbox.stub();
    const handler3 = sandbox.stub();
    const handler4 = sandbox.stub();

    network
      .getSurrogate()
      .registerPreHook('connect', handler4, { priority: 4, useNext: false })
      .registerPreHook('connect', handler2, { priority: Infinity, useNext: false })
      .registerPreHook('connect', handler3, { priority: 100, useNext: false })
      .registerPreHook('connect', handler1, { priority: -1, useNext: false });

    network.connect();

    expect(handler1.calledOnce).to.be.true;
    expect(handler2.calledOnce).to.be.true;
    expect(handler3.calledOnce).to.be.true;
    expect(handler4.calledOnce).to.be.true;

    expect(handler1.calledBefore(handler2)).to.be.false;
    expect(handler1.calledBefore(handler3)).to.be.false;
    expect(handler1.calledBefore(handler4)).to.be.false;
    expect(handler1.calledImmediatelyAfter(handler4)).to.be.true;

    expect(handler2.calledBefore(handler1)).to.be.true;
    expect(handler2.calledBefore(handler3)).to.be.true;
    expect(handler2.calledBefore(handler4)).to.be.true;
    expect(handler2.calledImmediatelyBefore(handler3)).to.be.true;

    expect(handler3.calledBefore(handler1)).to.be.true;
    expect(handler3.calledBefore(handler2)).to.be.false;
    expect(handler3.calledBefore(handler4)).to.be.true;
    expect(handler3.calledImmediatelyAfter(handler2)).to.be.true;
    expect(handler3.calledImmediatelyBefore(handler4)).to.be.true;

    expect(handler4.calledBefore(handler1)).to.be.true;
    expect(handler4.calledBefore(handler2)).to.be.false;
    expect(handler4.calledBefore(handler3)).to.be.false;
    expect(handler4.calledImmediatelyBefore(handler1)).to.be.true;
    expect(handler4.calledImmediatelyAfter(handler3)).to.be.true;
  });

  it(`should run pre and post priority independently`, () => {
    const handler1 = sandbox.stub();
    const handler2 = sandbox.stub();
    const handler3 = sandbox.stub();
    const handler4 = sandbox.stub();

    network
      .getSurrogate()
      .registerPreHook('connect', handler4, { priority: 4, useNext: false })
      .registerPreHook('connect', handler2, { priority: -2, useNext: false })
      .registerPostHook('connect', handler3, { priority: -100, useNext: false })
      .registerPostHook('connect', handler1, { priority: 1, useNext: false });

    network.connect();

    expect(handler1.calledOnce).to.be.true;
    expect(handler2.calledOnce).to.be.true;
    expect(handler3.calledOnce).to.be.true;
    expect(handler4.calledOnce).to.be.true;

    expect(handler1.calledBefore(handler2)).to.be.false;
    expect(handler1.calledBefore(handler3)).to.be.true;
    expect(handler1.calledBefore(handler4)).to.be.false;

    expect(handler2.calledBefore(handler1)).to.be.true;
    expect(handler2.calledBefore(handler3)).to.be.true;
    expect(handler2.calledBefore(handler4)).to.be.false;

    expect(handler3.calledBefore(handler1)).to.be.false;
    expect(handler3.calledBefore(handler2)).to.be.false;
    expect(handler3.calledBefore(handler4)).to.be.false;

    expect(handler4.calledBefore(handler1)).to.be.true;
    expect(handler4.calledBefore(handler2)).to.be.true;
    expect(handler4.calledBefore(handler3)).to.be.true;
  });
});
