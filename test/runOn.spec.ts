import { Surrogate, wrapSurrogate } from '../src';
import { Network } from './lib/network';
import * as sinon from 'sinon';
import { expect } from 'chai';

describe(`RunOn`, () => {
  let network: Surrogate<Network>;

  beforeEach(() => {
    network = wrapSurrogate(new Network());
    sinon.stub(console, 'error');
    sinon.stub(console, 'log');
  });

  afterEach(() => {
    sinon.restore();
  });

  describe(`Error`, () => {
    it(`should accept runOnError function in options`, () => {
      const handler = sinon.stub();
      const errorRunner = sinon.stub();

      network.getSurrogate().registerPreHook('connect', handler, {
        runOnError: errorRunner,
      });
    });
  });
});
