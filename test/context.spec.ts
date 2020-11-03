import { Context } from '../src/lib/context';
import { Network } from './lib/network';
import { Surrogate } from '../src';
import { expect } from 'chai';

describe('Context', () => {
  let network: Network;
  let context: Context<Network>;

  beforeEach(() => {
    network = new Network();
    context = new Context(network, network as Surrogate<Network>, 'connect', network.connect);
  });

  it('should be an instance of Context', () => {
    expect(context).to.be.instanceOf(Context);
  });

  it('should create a retrievable context', () => {
    const connect = network.connect;

    context.createRetrievableContext();

    expect(network.connect).to.not.equal(connect);
  });

  it('should test if a function is already context bound', () => {
    expect(Context.isAlreadyContextBound(network.connect)).to.be.false;

    context.createRetrievableContext();

    expect(Context.isAlreadyContextBound(network.connect)).to.be.true;
  });

  it('should retrieve the current context', () => {
    context.createRetrievableContext();

    expect(network.connect()).to.equal(context);
    expect(context.retrieveContext()).to.equal(context);
  });

  it('should reset the current context', () => {
    const connect = network.connect;

    context.createRetrievableContext();

    expect(network.connect).to.not.equal(connect);

    context.resetContext();

    expect(network.connect).to.equal(connect);
  });
});
