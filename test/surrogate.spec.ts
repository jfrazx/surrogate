import { expect } from 'chai';

import { surrogateWrap, Surrogate } from '../src';
import { Network } from './lib/network';

describe('SurrogateProxy', () => {
  let network: Surrogate<Network>;

  beforeEach(() => {
    network = surrogateWrap(new Network());
  });

  describe('General', () => {
    it('should transparently wrap objects', () => {
      expect(network).to.be.instanceof(Network);
    });
  });
});
