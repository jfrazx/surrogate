import { Surrogate, wrapSurrogate } from '../src';
import { Context } from '../src/context';
import { Network } from './lib/network';
import { expect } from 'chai';

describe('Context', () => {
  describe('Class', () => {
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

  describe(`Maintain`, () => {
    it(`should not maintain context when no hooks are present`, () => {
      const network = wrapSurrogate(new Network(), {});
      const method = network.disable;

      expect(network.isEnabled).to.be.true;
      expect(() => method()).to.throw(Error);

      expect(network.isEnabled).to.be.true;
    });

    it(`should maintain context when no hooks are present`, () => {
      const network = wrapSurrogate(new Network(), {
        maintainContext: true,
      });

      const method = network.disable;

      expect(network.isEnabled).to.be.true;

      method();

      expect(network.isEnabled).to.be.false;

      const method2 = network.enable;

      method2();

      expect(network.isEnabled).to.be.true;
    });

    it(`should maintain context for a specific method`, () => {
      const network = wrapSurrogate(new Network(), {
        maintainContext: 'disable',
      });

      const method = network.disable;
      const method2 = network.enable;

      expect(network.isEnabled).to.be.true;

      method();

      expect(network.isEnabled).to.be.false;

      expect(() => method2()).to.throw(TypeError);

      expect(network.isEnabled).to.be.false;
    });

    it(`should maintain context for multiple specified methods`, () => {
      const network = wrapSurrogate(new Network(), {
        maintainContext: ['disable', 'enable'],
      });

      const method = network.disable;
      const method2 = network.enable;
      const method3 = network.connect;

      expect(network.isEnabled).to.be.true;

      method();

      expect(network.isEnabled).to.be.false;

      method2();

      expect(network.isEnabled).to.be.true;

      expect(() => method3()).to.throw(TypeError);
    });

    it(`should ignore invalid context`, () => {
      const network = wrapSurrogate(new Network(), {
        maintainContext: null,
      });

      const method = network.disable;

      expect(network.isEnabled).to.be.true;

      expect(() => method()).to.throw(TypeError);

      expect(network.isEnabled).to.be.true;
    });
  });
});
