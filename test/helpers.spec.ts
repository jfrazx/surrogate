import { createCorrelationId, isAsync, isPromiseLike } from '../src/helpers';
import { wrapSurrogate, NextParameters } from '../src';
import * as sinon from 'sinon';
import { expect } from 'chai';

describe('Helpers', () => {
  describe('createCorrelationId', () => {
    const uuidV4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

    afterEach(() => {
      sinon.restore();
    });

    it('should generate a v4 uuid', () => {
      expect(createCorrelationId()).to.match(uuidV4);
    });

    describe('without crypto.randomUUID (insecure browser context)', () => {
      beforeEach(() => {
        sinon.stub(globalThis.crypto, 'randomUUID').value(undefined);
      });

      it('should still generate unique v4 uuids', () => {
        const first = createCorrelationId();

        expect(first).to.match(uuidV4);
        expect(first).to.not.equal(createCorrelationId());
      });

      it('should still run hooked methods', () => {
        const target = wrapSurrogate({ ping: () => 'pong' });
        const hook = sinon.spy(({ next }: NextParameters<any>) => next.next());

        target.getSurrogate().registerPreHook('ping', hook);

        expect(target.ping()).to.equal('pong');
        expect(hook.calledOnce).to.be.true;

        target.disposeSurrogate();
      });
    });
  });

  it('should return true if it is an async method', () => {
    class Network {
      async connect() {}
    }

    const network = new Network();

    expect(isAsync(network.connect)).to.be.true;
  });

  it('should return true if it is an async function', () => {
    expect(isAsync(async () => {})).to.be.true;
  });

  it('should return false if it is not an async method', () => {
    class Network {
      connect() {}
    }

    const network = new Network();

    expect(isAsync(network.connect)).to.be.false;
  });

  it('should return false if it is not an async function', () => {
    expect(isAsync(() => {})).to.be.false;
  });

  it('should return true if it is a promise', () => {
    expect(isPromiseLike(new Promise(() => {}))).to.be.true;
  });

  it('should return true if it has a "then" method', () => {
    expect(
      isPromiseLike({
        then: () => {},
      }),
    ).to.be.true;
  });

  it('should return false if it is not a promise', () => {
    expect(isPromiseLike(() => {})).to.be.false;
  });

  it('should return false if it does not have a "then" method', () => {
    expect(
      isPromiseLike({
        hen: () => {},
      }),
    ).to.be.false;
  });

  it('should return false if it is null', () => {
    expect(isPromiseLike(null)).to.be.false;
  });
});
