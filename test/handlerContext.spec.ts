import { wrapSurrogate, NextParameters, SurrogateContext, Surrogate } from '../src';
import { Network } from './lib/network';
import * as sinon from 'sinon';
import { expect } from 'chai';

describe('HandlerContext', () => {
  let network: Surrogate<Network>;

  beforeEach(() => {
    network = wrapSurrogate(new Network());
    sinon.stub(console, 'error');
    sinon.stub(console, 'log');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should call handlers with the proxied (unwrapped) object as context', () => {
    network
      .getSurrogate()
      .registerPreHook('connect', function (this: Network, { next }: NextParameters<Network>) {
        expect(this).to.be.instanceOf(Network);
        expect(this).to.not.equal(network);
        next.next();
      });

    network.connect();
  });

  it('should call handlers with the surrogate (wrapped) object as context', () => {
    network.getSurrogate().registerPreHook(
      'connect',
      function (this: Network, { next }: NextParameters<Network>) {
        expect(this).to.be.instanceOf(Network);
        expect(this).to.equal(network);
        next.next();
      },
      {
        useContext: SurrogateContext.Surrogate,
      },
    );

    network.connect();
  });

  it('should call handlers with the passed options object as context', () => {
    const otherNetwork = new Network();

    network.getSurrogate().registerPreHook(
      'connect',
      function (this: Network, { next }: NextParameters<Network>) {
        expect(this).to.be.instanceOf(Network);
        expect(this).to.equal(otherNetwork);
        next.next();
      },
      {
        useContext: otherNetwork,
      },
    );

    network.connect();
  });

  it('should run with a global context', () => {
    class GlobalContextTest {
      method(instance: GlobalContextTest) {
        expect(
          this,
          'GlobalContextTest method "this" is equal to passed instance',
        ).not.to.equal(instance);
      }
    }

    const instance = new GlobalContextTest();

    const globalContextTest = wrapSurrogate(instance, {
      useContext: 'surrogate',
    });

    globalContextTest
      .getSurrogate()
      .registerPreHook('method', function (this: GlobalContextTest, { next, surrogate }) {
        expect(
          surrogate,
          'GlobalContextTest NextParameters Surrogate is not equal to this',
        ).to.equal(this);

        next.next();
      });

    globalContextTest.method(instance);
  });

  it('should method specific context should override global context', () => {
    class GlobalContextTest {
      method(instance: GlobalContextTest) {
        expect(
          this,
          'GlobalContextTest method "this" is equal to passed instance',
        ).not.to.equal(instance);
      }
    }

    const instance = new GlobalContextTest();

    const globalContextTest = wrapSurrogate(instance, {
      useContext: 'instance',
    });

    globalContextTest
      .getSurrogate()
      .registerPreHook('method', function (this: GlobalContextTest, { next, surrogate }) {
        expect(
          surrogate,
          'GlobalContextTest NextParameters Surrogate is equal to this',
        ).not.to.equal(this);

        next.next();
      });

    globalContextTest.method(instance);
  });
});
