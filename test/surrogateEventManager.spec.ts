import { Network } from './lib/network';
import { expect } from 'chai';
import sinon from 'sinon';
import {
  Which,
  INext,
  PRE_HOOK,
  Surrogate,
  POST_HOOK,
  surrogateWrap,
  SurrogateEventManager,
} from '../src';

describe('Surrogate Event Manager', () => {
  let network: Surrogate<Network>;
  let log: sinon.SinonStub<any, void>;

  beforeEach(() => {
    network = surrogateWrap(new Network());
    log = sinon.stub(console, 'log');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should retrieve an instance of SurrogateEventManager', () => {
    const surrogate = network.getSurrogate();

    expect(surrogate).to.be.instanceOf(SurrogateEventManager);
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
      expect(Object.getOwnPropertySymbols(events)).to.be.length(2);

      Object.getOwnPropertySymbols(events).forEach((symbol: any) => {
        const handlers = events[symbol as Which];

        expect(symbol).to.be.a('symbol');
        expect(handlers).to.be.an('array');
        expect(handlers).to.have.lengthOf(1);
      });
    });

    it('should retrieve for an unregistered event', () => {
      const surrogate = network.getSurrogate();

      const events = surrogate.getEventHandlers('connect');

      expect(events).to.be.an('object');
      expect(Object.getOwnPropertySymbols(events)).to.be.length(2);

      Object.getOwnPropertySymbols(events).forEach((symbol: any) => {
        const handlers = events[symbol as Which];

        expect(symbol).to.be.a('symbol');
        expect(handlers).to.be.an('array');
        expect(handlers).to.have.lengthOf(0);
      });
    });
  });

  describe('Register', () => {
    it('should register a single pre hook', () => {
      const func = sinon.spy(function () {});

      network.getSurrogate().registerPreHook(network.connect.name, func);
      network.connect();

      sinon.assert.calledOnce(func);
      sinon.assert.calledOnce(log);
    });

    it('should register multiple pre hooks', () => {
      const name = network.connect.name;
      const func1 = sinon.spy((next: INext<Network>) => next.next());
      const func2 = sinon.spy(() => {});

      network.getSurrogate().registerPreHook(name, func1).registerPreHook(name, func2);
      network.connect();

      sinon.assert.calledOnce(func1);
      sinon.assert.calledOnce(func2);
      sinon.assert.calledOnce(log);
    });

    it('should register a single post hook', () => {
      const func = sinon.spy(() => {});

      network.getSurrogate().registerPostHook('connect', func);
      network.connect();

      sinon.assert.calledOnce(func);
      sinon.assert.calledOnce(log);
    });

    it('should register multiple post hooks', () => {
      const name = network.disconnect.name;
      const func1 = sinon.spy((next: INext<Network>) => next.next());
      const func2 = sinon.spy(() => {});

      network.getSurrogate().registerPostHook(name, func1).registerPostHook(name, func2);

      network.disconnect();

      sinon.assert.calledOnce(func1);
      sinon.assert.calledOnce(func2);
      sinon.assert.calledOnce(log);
    });

    it('should register multiple pre and post hooks', () => {
      const name = network.connect.name;
      const func1 = sinon.spy((next: INext<Network>) => next.next());
      const func2 = sinon.spy((next: INext<Network>) => next.next());
      const func3 = sinon.spy(function (next: INext<Network>) {
        next.next();
      });
      const func4 = sinon.spy(function () {});

      network
        .getSurrogate()
        .registerPreHook(name, [func1, func2])
        .registerPostHook(name, [func3, func4]);

      network.connect();

      sinon.assert.calledOnce(func1);
      sinon.assert.calledOnce(func2);
      sinon.assert.calledOnce(func3);
      sinon.assert.calledOnce(func4);
      sinon.assert.calledOnce(log);
      sinon.assert.calledWith(log, 'connecting to somewhere...');
    });
  });

  describe('Deregister', () => {
    it('should deregister a single pre hook', () => {
      const surrogate = network.getSurrogate();
      const func1 = () => {};
      const func2 = () => {};

      surrogate.registerPreHook('connect', func1).registerPreHook('connect', func2);

      console.log(surrogate);

      const { [PRE_HOOK]: prePre } = surrogate.getEventHandlers('connect');
      expect(prePre).to.have.lengthOf(2);

      surrogate.deregisterPreHook('connect', func1);

      const { [PRE_HOOK]: preAfter } = surrogate.getEventHandlers('connect');

      expect(prePre).to.not.equal(preAfter);
      expect(preAfter).to.have.lengthOf(1);
    });

    it('should deregister a single post hook', () => {
      const surrogate = network.getSurrogate();
      const func1 = () => {};
      const func2 = () => {};

      surrogate.registerPostHook('connect', func2);
      surrogate.registerPostHook('connect', func1);

      const { [POST_HOOK]: postPre } = surrogate.getEventHandlers('connect');
      expect(postPre).to.have.lengthOf(2);

      surrogate.deregisterPostHook('connect', func1);

      const { [POST_HOOK]: postAfter } = surrogate.getEventHandlers('connect');

      expect(postPre).to.not.equal(postAfter);
      expect(postAfter).to.have.lengthOf(1);
    });

    it('should deregister all pre hooks for an event', () => {
      const surrogate = network.getSurrogate();
      const func1 = () => {};
      const func2 = () => {};

      surrogate.registerPreHook('connect', func1).registerPreHook('connect', func2);

      const { [PRE_HOOK]: prePre } = surrogate.getEventHandlers('connect');
      expect(prePre).to.have.lengthOf(2);

      surrogate.deregisterPreHooks('connect');

      const { [PRE_HOOK]: preAfter } = surrogate.getEventHandlers('connect');

      expect(prePre).to.not.equal(preAfter);
      expect(preAfter).to.have.lengthOf(0);
    });

    it('should deregister all post hooks for an event', () => {
      const surrogate = network.getSurrogate();
      const func1 = () => {};
      const func2 = () => {};

      surrogate.registerPostHook('connect', func1).registerPostHook('connect', func2);

      const { [POST_HOOK]: postPre } = surrogate.getEventHandlers('connect');
      expect(postPre).to.have.lengthOf(2);

      surrogate.deregisterPostHooks('connect');

      const { [POST_HOOK]: postAfter } = surrogate.getEventHandlers('connect');

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

      const {
        [PRE_HOOK]: prePreConnect,
        [POST_HOOK]: postPreConnect,
      } = surrogate.getEventHandlers('connect');
      const {
        [PRE_HOOK]: prePreDisconnect,
        [POST_HOOK]: postPreDisconnect,
      } = surrogate.getEventHandlers('disconnect');

      expect(prePreConnect).to.have.lengthOf(1);
      expect(prePreDisconnect).to.have.lengthOf(1);
      expect(postPreConnect).to.have.lengthOf(1);
      expect(postPreDisconnect).to.have.lengthOf(1);

      surrogate.deregisterHooks();

      const {
        [PRE_HOOK]: prePostConnect,
        [POST_HOOK]: postPostConnect,
      } = surrogate.getEventHandlers('connect');
      const {
        [PRE_HOOK]: prePostDisconnect,
        [POST_HOOK]: postPostDisconnect,
      } = surrogate.getEventHandlers('disconnect');

      expect(prePostConnect).to.have.lengthOf(0);
      expect(prePostDisconnect).to.have.lengthOf(0);
      expect(postPostConnect).to.have.lengthOf(0);
      expect(postPostDisconnect).to.have.lengthOf(0);
    });
  });
});
