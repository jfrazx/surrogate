import { Context } from '../src/context';
import { Network } from './lib/network';
import { Surrogate } from '../src';
import { expect } from 'chai';

describe('Context', () => {
  let network: Network;
  let context: Context<Network>;

  beforeEach(() => {
    network = new Network();
    context = new Context(
      network,
      network as unknown as Surrogate<Network>,
      'connect',
      network.connect,
      [],
    );
  });

  it('should be an instance of Context', () => {
    expect(context).to.be.instanceOf(Context);
  });
});
