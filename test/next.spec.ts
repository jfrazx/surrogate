import * as sinon from 'sinon';
import { expect } from 'chai';

import { surrogateWrap, Surrogate } from '../src';
import { FinalNext } from '../src/next/final-next';
import { INext } from '../src/interfaces';
import { Network } from './lib/network';
import { Next } from '../src/next';

describe('Next', () => {
  let network: Surrogate<Network>;
  let log: sinon.SinonStub<any, void>;

  beforeEach(() => {
    network = surrogateWrap(new Network());
    log = sinon.stub(console, 'log');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should pass Next objects to the callbacks', () => {
    const func1 = sinon.spy(function(next: INext) {
      expect(next).to.be.instanceOf(Next);
      next.next();
    });

    const func2 = sinon.spy((next: INext) => {
      expect(next).to.be.instanceOf(FinalNext);

      next.next();
    });

    network.getSurrogate().registerPreHook(network.connect.name, [func1, func2]);
    network.connect();

    sinon.assert.calledOnce(func1);
    sinon.assert.calledOnce(func2);
    sinon.assert.calledOnce(log);
  });

  it('should call handlers with the proxied (unwrapped) object as context', () => {
    network
      .getSurrogate()
      .registerPreHook('connect', function(this: Network, next: INext) {
        expect(this).to.be.instanceOf(Network);
        expect(this).to.not.equal(network);
        next.next();
      });

    network.connect();
  });

  it('should pass arguments from one handler to the next', () => {
    network.getSurrogate().registerPreHook('connect', [
      next => next.next({ using: [1, 2, 3] }),
      (next, arg1: number, arg2: number, arg3: number) => {
        expect(arg1).to.be.a('number');
        expect(arg2).to.be.a('number');
        expect(arg3).to.be.a('number');
        expect(arg1).to.equal(1);
        expect(arg2).to.equal(2);
        expect(arg3).to.equal(3);
        next.next();
      },
    ]);

    network.connect();
  });

  describe('Skip', () => {
    it('should skip a single handler', () => {
      const func1 = sinon.spy((next: INext) => next.skip());
      const func2 = sinon.spy((next: INext) => next.next());
      const func3 = sinon.spy((next: INext) => next.next());

      network.getSurrogate().registerPreHook('connect', [func1, func2, func3]);
      network.connect();

      sinon.assert.calledOnce(func1);
      sinon.assert.notCalled(func2);
      sinon.assert.calledOnce(func3);
      sinon.assert.calledOnce(log);
    });

    it('should skip multiple handlers', () => {
      const func1 = sinon.spy((next: INext) => next.skip(2));
      const func2 = sinon.spy((next: INext) => next.next());
      const func3 = sinon.spy((next: INext) => next.next());
      const func4 = sinon.spy((next: INext) => next.next());

      network
        .getSurrogate()
        .registerPreHook('connect', [func1, func2, func3, func4]);
      network.connect();

      sinon.assert.calledOnce(func1);
      sinon.assert.notCalled(func2);
      sinon.assert.notCalled(func3);
      sinon.assert.calledOnce(func4);
      sinon.assert.calledOnce(log);
    });

    it('should skip and the resume the next chain', () => {
      const func1 = sinon.spy((next: INext) => next.next());
      const func2 = sinon.spy((next: INext) => next.skip(2));
      const func3 = sinon.spy((next: INext) => next.next());
      const func4 = sinon.spy((next: INext) => next.next());
      const func5 = sinon.spy((next: INext) => next.next());

      network
        .getSurrogate()
        .registerPreHook('connect', [func1, func2, func3, func4, func5]);
      network.connect();

      sinon.assert.calledOnce(func1);
      sinon.assert.calledOnce(func2);
      sinon.assert.notCalled(func3);
      sinon.assert.notCalled(func4);
      sinon.assert.calledOnce(func5);
      sinon.assert.calledOnce(log);
    });

    it('should not skip the calling method', () => {
      const func1 = sinon.spy((next: INext) => next.next());
      const func2 = sinon.spy((next: INext) => next.skip(20));
      const func3 = sinon.spy((next: INext) => next.next());
      const func4 = sinon.spy((next: INext) => next.next());

      network
        .getSurrogate()
        .registerPreHook('connect', [func1, func2, func3, func4]);
      network.connect();

      sinon.assert.calledOnce(func1);
      sinon.assert.calledOnce(func2);
      sinon.assert.notCalled(func3);
      sinon.assert.notCalled(func4);
      sinon.assert.calledOnce(log);
    });

    it('should not skip post handlers when skipping pre handlers', () => {
      const func1 = sinon.spy((next: INext) => next.next());
      const func2 = sinon.spy((next: INext) => next.skip(20));
      const func3 = sinon.spy((next: INext) => next.next());
      const func4 = sinon.spy((next: INext) => next.next());
      const func5 = sinon.spy((next: INext) => next.next());

      const func6 = sinon.spy((next: INext) => next.next());
      const func7 = sinon.spy((next: INext) => next.next());
      const func8 = sinon.spy((next: INext) => next.next());
      const func9 = sinon.spy((next: INext) => next.next());

      network
        .getSurrogate()
        .registerPreHook('connect', [func1, func2, func3, func4, func5])
        .registerPostHook('connect', [func6, func7, func8, func9]);
      network.connect();

      sinon.assert.calledOnce(func1);
      sinon.assert.calledOnce(func2);
      sinon.assert.notCalled(func3);
      sinon.assert.notCalled(func4);
      sinon.assert.notCalled(func5);
      sinon.assert.calledOnce(log);
      sinon.assert.calledOnce(func6);
      sinon.assert.calledOnce(func7);
      sinon.assert.calledOnce(func8);
      sinon.assert.calledOnce(func9);
    });

    it('should skip pre and post handlers', () => {
      const func1 = sinon.spy((next: INext) => next.next());
      const func2 = sinon.spy((next: INext) => next.skip(20));
      const func3 = sinon.spy((next: INext) => next.next());
      const func4 = sinon.spy((next: INext) => next.next());
      const func5 = sinon.spy((next: INext) => next.next());

      const func6 = sinon.spy((next: INext) => next.next());
      const func7 = sinon.spy((next: INext) => next.skip());
      const func8 = sinon.spy((next: INext) => next.next());
      const func9 = sinon.spy((next: INext) => next.next());

      network
        .getSurrogate()
        .registerPreHook('connect', [func1, func2, func3, func4, func5])
        .registerPostHook('connect', [func6, func7, func8, func9]);
      network.connect();

      sinon.assert.calledOnce(func1);
      sinon.assert.calledOnce(func2);
      sinon.assert.notCalled(func3);
      sinon.assert.notCalled(func4);
      sinon.assert.notCalled(func5);
      sinon.assert.calledOnce(log);
      sinon.assert.calledOnce(func6);
      sinon.assert.calledOnce(func7);
      sinon.assert.notCalled(func8);
      sinon.assert.calledOnce(func9);
    });
  });
});
