import { SurrogateProxy, Surrogate } from '../index';
import { Network } from './lib/network';
import { expect } from 'chai';

describe('SurrogateProxy', () => {
  let network: Surrogate<Network>;

  before(() => {
    network = SurrogateProxy.wrap(new Network());
  });

  it('should transparently wrap objects', () => {
    expect(network).to.be.instanceof(Network);
  });

  it('should register a single pre hook', () => {
    network.registerPreHook('connect', function(target: Network) {
      expect(target).to.be.instanceof(Network);
    });

    network.connect();
  });
});
