import { wrapSurrogate, Surrogate } from '../src';
import { Network } from './lib/network';
import { expect } from 'chai';

describe('SurrogateProxy', () => {
  let network: Surrogate<Network>;

  beforeEach(() => {
    network = wrapSurrogate(new Network());
  });

  describe('General', () => {
    it('should transparently wrap objects', () => {
      expect(network).to.be.instanceof(Network);
    });
  });
});
