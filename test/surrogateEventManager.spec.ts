import { PRE, POST, NextParameters, Surrogate, wrapSurrogate } from '../src';
import { EventManager } from '../src/manager';
import { Network } from './lib/network';
import { expect } from 'chai';
import sinon from 'sinon';

describe('Surrogate Event Manager', () => {
  const sandbox = sinon.createSandbox();
  let network: Surrogate<Network>;
  let log: sinon.SinonStub<any, void>;

  beforeEach(() => {
    network = wrapSurrogate(new Network());
    log = sandbox.stub(console, 'log');
  });

  afterEach(() => {
    sandbox.restore();
    network.disposeSurrogate();
  });

  it('should retrieve an instance of EventManager', () => {
    const surrogate = network.getSurrogate();

    expect(surrogate).to.be.instanceOf(EventManager);
  });

  it(`should retrieve the event map`, () => {
    const manager = network.getSurrogate();
    const eventMap = manager.getEventMap();

    expect(eventMap).to.be.an('object');
  });

  it('should always retrieve the same event manager for the same object', () => {
    const s1 = network.getSurrogate();
    const s2 = network.getSurrogate();
    const s3 = network.getSurrogate();

    expect(s1 === s2 && s2 === s3).to.be.true;
  });

  describe('Event Handlers', () => {
    it('should retrieve event handlers', () => {
      const surrogate = network.getSurrogate();

      surrogate.registerPreHook('connect', () => {}).registerPostHook('connect', () => {});

      const events = surrogate.getEventHandlers('connect');

      expect(events).to.be.an('object');
      expect(Object.keys(events)).to.be.length(2);

      Object.entries(events).forEach(([hookType, handlers]) => {
        expect(hookType).to.be.a('string');
        expect(handlers).to.be.an('array');
        expect(handlers).to.have.lengthOf(1);
      });
    });

    it('should retrieve for an unregistered event', () => {
      const surrogate = network.getSurrogate();

      const events = surrogate.getEventHandlers('connect');

      expect(events).to.be.an('object');
      expect(Object.keys(events)).to.be.length(2);

      Object.entries(events).forEach(([hookType, handlers]) => {
        expect(hookType).to.be.a('string');
        expect(handlers).to.be.an('array');
        expect(handlers).to.have.lengthOf(0);
      });
    });
  });

  describe('Register', () => {
    it('should register a single pre hook', () => {
      const func = sandbox.spy(function () {});

      network.getSurrogate().registerPreHook('connect', func, {
        useNext: false,
      });
      network.connect();

      sandbox.assert.calledOnce(func);
      sandbox.assert.calledOnce(log);
    });

    it('should register multiple pre hooks', () => {
      const name = network.connect.name as keyof Network;
      const func1 = sandbox.spy(({ next }: NextParameters<Network>) => next.next());
      const func2 = sandbox.spy(() => {});

      network
        .getSurrogate()
        .registerPreHook(name, [func1])
        .registerPreHook(name, func2, { useNext: false });

      network.connect();

      sandbox.assert.calledOnce(func1);
      sandbox.assert.calledOnce(func2);
      sandbox.assert.calledOnce(log);
    });

    it('should register a single post hook', () => {
      const func = sandbox.spy(() => {});

      network.getSurrogate().registerPostHook('connect', func, { useNext: false });
      network.connect();

      sandbox.assert.calledOnce(func);
      sandbox.assert.calledOnce(log);
    });

    it('should register multiple post hooks', () => {
      const name = network.disconnect.name as keyof Network;
      const func1 = sandbox.spy(({ next }: NextParameters<Network>) => next.next());
      const func2 = sandbox.spy(() => {});

      network
        .getSurrogate()
        .registerPostHook(name, func1)
        .registerPostHook(name, func2, { useNext: false });

      network.disconnect();

      sandbox.assert.calledOnce(func1);
      sandbox.assert.calledOnce(func2);
      sandbox.assert.calledOnce(log);
    });

    it('should register multiple pre and post hooks', () => {
      const name = network.connect.name as keyof Network;
      const func1 = sandbox.spy(({ next }: NextParameters<Network>) => next.next());
      const func2 = sandbox.spy(({ next }: NextParameters<Network>) => next.next());
      const func3 = sandbox.spy(function ({ next }: NextParameters<Network>) {
        next.next();
      });
      const func4 = sandbox.spy(function () {});

      network
        .getSurrogate()
        .registerPreHook(name, [func1, func2])
        .registerPostHook(name, [func3, func4]);

      network.connect();

      sandbox.assert.calledOnce(func1);
      sandbox.assert.calledOnce(func2);
      sandbox.assert.calledOnce(func3);
      sandbox.assert.calledOnce(func4);
      sandbox.assert.calledOnce(log);
      sandbox.assert.calledWith(log, 'connecting to somewhere...');
    });
  });

  describe('Deregister', () => {
    it('should deregister a single pre hook', () => {
      const surrogate = network.getSurrogate();
      const func1 = () => {};
      const func2 = () => {};

      surrogate.registerPreHook('connect', func1).registerPreHook('connect', func2);

      const { [PRE]: prePre } = surrogate.getEventHandlers('connect');
      expect(prePre).to.have.lengthOf(2);

      surrogate.deregisterPreHook('connect', func1);

      const { [PRE]: preAfter } = surrogate.getEventHandlers('connect');

      expect(prePre).to.not.equal(preAfter);
      expect(preAfter).to.have.lengthOf(1);
    });

    it('should deregister a single post hook', () => {
      const surrogate = network.getSurrogate();
      const func1 = () => {};
      const func2 = () => {};

      surrogate.registerPostHook('connect', func2);
      surrogate.registerPostHook('connect', func1);

      const { [POST]: postPre } = surrogate.getEventHandlers('connect');
      expect(postPre).to.have.lengthOf(2);

      surrogate.deregisterPostHook('connect', func1);

      const { [POST]: postAfter } = surrogate.getEventHandlers('connect');

      expect(postPre).to.not.equal(postAfter);
      expect(postAfter).to.have.lengthOf(1);
    });

    it('should deregister all pre hooks for an event', () => {
      const surrogate = network.getSurrogate();
      const func1 = () => {};
      const func2 = () => {};

      surrogate.registerPreHook('connect', func1).registerPreHook('connect', func2);

      const { [PRE]: prePre } = surrogate.getEventHandlers('connect');
      expect(prePre).to.have.lengthOf(2);

      surrogate.deregisterPreHooks('connect');

      const { [PRE]: preAfter } = surrogate.getEventHandlers('connect');

      expect(prePre).to.not.equal(preAfter);
      expect(preAfter).to.have.lengthOf(0);
    });

    it('should deregister all post hooks for an event', () => {
      const surrogate = network.getSurrogate();
      const func1 = () => {};
      const func2 = () => {};

      surrogate.registerPostHook('connect', func1).registerPostHook('connect', func2);

      const { [POST]: postPre } = surrogate.getEventHandlers('connect');
      expect(postPre).to.have.lengthOf(2);

      surrogate.deregisterPostHooks('connect');

      const { [POST]: postAfter } = surrogate.getEventHandlers('connect');

      expect(postPre).to.not.equal(postAfter);
      expect(postAfter).to.have.lengthOf(0);
    });

    it('should deregister all hooks', () => {
      const surrogate = network.getSurrogate();

      const func1 = () => {};
      const func2 = () => {};
      const func3 = () => {};
      const func4 = () => {};

      surrogate
        .registerPreHook('connect', func1)
        .registerPostHook('connect', func2)
        .registerPreHook('disconnect', func3)
        .registerPostHook('disconnect', func4);

      const { [PRE]: prePreConnect, [POST]: postPreConnect } =
        surrogate.getEventHandlers('connect');
      const { [PRE]: prePreDisconnect, [POST]: postPreDisconnect } =
        surrogate.getEventHandlers('disconnect');

      expect(prePreConnect).to.have.lengthOf(1);
      expect(prePreDisconnect).to.have.lengthOf(1);
      expect(postPreConnect).to.have.lengthOf(1);
      expect(postPreDisconnect).to.have.lengthOf(1);

      surrogate.deregisterHooks();

      const { [PRE]: prePostConnect, [POST]: postPostConnect } =
        surrogate.getEventHandlers('connect');
      const { [PRE]: prePostDisconnect, [POST]: postPostDisconnect } =
        surrogate.getEventHandlers('disconnect');

      expect(prePostConnect).to.have.lengthOf(0);
      expect(prePostDisconnect).to.have.lengthOf(0);
      expect(postPostConnect).to.have.lengthOf(0);
      expect(postPostDisconnect).to.have.lengthOf(0);
    });
  });
});
