import { expect } from 'chai';

import { FinalNext } from '../src/next/final-next';
import { surrogateWrap, Surrogate } from '../src';
import { Network } from './lib/network';
import { Next } from '../src/next';

describe('SurrogateProxy', () => {
  let network: Surrogate<Network>;

  beforeEach(() => {
    network = surrogateWrap(new Network());
  });

  it('should transparently wrap objects', () => {
    expect(network).to.be.instanceof(Network);
  });

  it('should register a single pre hook', () => {
    network.registerPreHook(network.connect, function() {
      console.log('running pre hook');
    });

    network.connect();
  });

  it('should register a single post hook', () => {
    network.registerPostHook('connect', function() {
      console.log('running post hook');
    });

    network.connect();
  });

  it('should pass Next objects to the callbacks', () => {
    network.registerPreHook(network.connect, [
      function(next) {
        expect(next).to.be.instanceOf(Next);
        next.next();
      },
      function(next) {
        expect(next).to.be.instanceOf(FinalNext);

        next.next();
      },
    ]);

    network.connect();
  });
});
