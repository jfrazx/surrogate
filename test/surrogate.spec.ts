import { surrogateWrap, Surrogate, SurrogateDelegate } from '../src';
import { SurrogatePre } from '../src/decorate';
import { Network } from './lib/network';
import { expect } from 'chai';

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
