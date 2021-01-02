import { SurrogateHandlerOptions, Surrogate, wrapSurrogate } from '../src';
import { ArgumentRuleRunner } from '../src/handler/rules';
import { Network } from './lib/network';
import { expect } from 'chai';

describe('ArgumentRuleRunner', () => {
  let target: Network;
  let receiver: Surrogate<Network>;
  const nextNode = {};

  beforeEach(() => {
    target = new Network();
    receiver = wrapSurrogate(target);
  });

  describe('General', () => {
    it('should be a constructor function', () => {
      expect(ArgumentRuleRunner).to.be.an('function');
    });
  });

  describe('Without Arguments', () => {
    it('should run arguments with default options', () => {
      const options: SurrogateHandlerOptions<any> = {
        useNext: true,
        passErrors: false,
        passInstance: false,
        passSurrogate: false,
      };

      const node: any = {
        container: {
          options,
        },
        context: {
          target,
          receiver,
        },
        nextNode,
      };

      const args = ArgumentRuleRunner.generateArgumentsFromRules(node, []);
      const [next] = args;

      expect(args).to.have.lengthOf(1);
      expect(next).to.equal(nextNode);
    });

    it('should run arguments with useNext: false', () => {
      const options: SurrogateHandlerOptions<any> = {
        useNext: false,
        passErrors: false,
        passInstance: false,
        passSurrogate: false,
      };

      const node: any = {
        container: {
          options,
        },
        context: {
          target,
          receiver,
        },
        nextNode,
      };

      const args = ArgumentRuleRunner.generateArgumentsFromRules(node, []);

      expect(args).to.have.lengthOf(0);
    });

    it('should run arguments with useNext: false, passInstance: true', () => {
      const options: SurrogateHandlerOptions<any> = {
        useNext: false,
        passErrors: false,
        passInstance: true,
        passSurrogate: false,
      };

      const node: any = {
        container: {
          options,
        },
        context: {
          target,
          receiver,
        },
        nextNode,
      };

      const args = ArgumentRuleRunner.generateArgumentsFromRules(node, []);
      const [instance] = args;

      expect(args).to.have.lengthOf(1);
      expect(instance).to.equal(target);
    });

    it('should run arguments with useNext: true, passInstance: true', () => {
      const options: SurrogateHandlerOptions<any> = {
        useNext: true,
        passErrors: false,
        passInstance: true,
        passSurrogate: false,
      };

      const node: any = {
        container: {
          options,
        },
        context: {
          target,
          receiver,
        },
        nextNode,
      };

      const args = ArgumentRuleRunner.generateArgumentsFromRules(node, []);
      const [next, instance] = args;

      expect(args).to.have.lengthOf(2);
      expect(next).to.equal(nextNode);
      expect(instance).to.equal(target);
    });

    it('should run arguments with useNext: false, passSurrogate: true', () => {
      const options: SurrogateHandlerOptions<any> = {
        useNext: false,
        passErrors: false,
        passInstance: false,
        passSurrogate: true,
      };

      const node: any = {
        container: {
          options,
        },
        context: {
          target,
          receiver,
        },
        nextNode,
      };

      const args = ArgumentRuleRunner.generateArgumentsFromRules(node, []);
      const [instance] = args;

      expect(args).to.have.lengthOf(1);
      expect(instance).to.equal(receiver);
    });

    it('should run arguments with useNext: true, passSurrogate: true', () => {
      const options: SurrogateHandlerOptions<any> = {
        useNext: true,
        passErrors: false,
        passInstance: false,
        passSurrogate: true,
      };

      const node: any = {
        container: {
          options,
        },
        context: {
          target,
          receiver,
        },
        nextNode,
      };

      const args = ArgumentRuleRunner.generateArgumentsFromRules(node, []);
      const [next, instance] = args;

      expect(args).to.have.lengthOf(2);
      expect(next).to.equal(nextNode);
      expect(instance).to.equal(receiver);
    });

    it('should run arguments with useNext: false, passErrors: true with no error', () => {
      const options: SurrogateHandlerOptions<any> = {
        useNext: false,
        passErrors: true,
        passInstance: false,
        passSurrogate: false,
      };

      const node: any = {
        container: {
          options,
        },
        context: {
          target,
          receiver,
        },
        nextNode,
      };

      const args = ArgumentRuleRunner.generateArgumentsFromRules(node, []);

      expect(args).to.have.lengthOf(0);
    });

    it('should run arguments with useNext: false, passErrors: true with error', () => {
      const options: SurrogateHandlerOptions<any> = {
        useNext: false,
        passErrors: true,
        passInstance: false,
        passSurrogate: false,
      };

      const node: any = {
        container: {
          options,
        },
        context: {
          target,
          receiver,
        },
        nextNode,
      };

      const passError = new Error('test');

      const args = ArgumentRuleRunner.generateArgumentsFromRules(node, [], passError);

      expect(args).to.have.lengthOf(1);

      const [error] = args;

      expect(error).to.equal(passError);
    });

    it('should run arguments with useNext: true, passErrors: true with no error', () => {
      const options: SurrogateHandlerOptions<any> = {
        useNext: true,
        passErrors: true,
        passInstance: false,
        passSurrogate: false,
      };

      const node: any = {
        container: {
          options,
        },
        context: {
          target,
          receiver,
        },
        nextNode,
      };

      const args = ArgumentRuleRunner.generateArgumentsFromRules(node, []);
      const [next] = args;

      expect(args).to.have.lengthOf(1);
      expect(next).to.equal(nextNode);
    });

    it('should run arguments with useNext: true, passErrors: true with error', () => {
      const options: SurrogateHandlerOptions<any> = {
        useNext: true,
        passErrors: true,
        passInstance: false,
        passSurrogate: false,
      };

      const node: any = {
        container: {
          options,
        },
        context: {
          target,
          receiver,
        },
        nextNode,
      };

      const passError = new Error('test');

      const args = ArgumentRuleRunner.generateArgumentsFromRules(node, [], passError);

      expect(args).to.have.lengthOf(2);

      const [error, next] = args;

      expect(error).to.equal(passError);
      expect(next).to.equal(nextNode);
    });

    it('should run arguments with useNext: false, passInstance: true, passSurrogate: true', () => {
      const options: SurrogateHandlerOptions<any> = {
        useNext: false,
        passErrors: false,
        passInstance: true,
        passSurrogate: true,
      };

      const node: any = {
        container: {
          options,
        },
        context: {
          target,
          receiver,
        },
        nextNode,
      };

      const args = ArgumentRuleRunner.generateArgumentsFromRules(node, []);
      const [instance, surrogate] = args;

      expect(args).to.have.lengthOf(2);
      expect(instance).to.equal(target);
      expect(surrogate).to.equal(receiver);
    });

    it('should run arguments with useNext: true, passInstance: true, passSurrogate: true', () => {
      const options: SurrogateHandlerOptions<any> = {
        useNext: true,
        passErrors: false,
        passInstance: true,
        passSurrogate: true,
      };

      const node: any = {
        container: {
          options,
        },
        context: {
          target,
          receiver,
        },
        nextNode,
      };

      const args = ArgumentRuleRunner.generateArgumentsFromRules(node, []);
      const [next, instance, surrogate] = args;

      expect(args).to.have.lengthOf(3);
      expect(next).to.equal(nextNode);
      expect(instance).to.equal(target);
      expect(surrogate).to.equal(receiver);
    });

    it('should run arguments with useNext: false, passInstance: true, passSurrogate: true, passErrors: true', () => {
      const options: SurrogateHandlerOptions<any> = {
        useNext: false,
        passErrors: true,
        passInstance: true,
        passSurrogate: true,
      };

      const passError = new Error('test');

      const node: any = {
        container: {
          options,
        },
        context: {
          target,
          receiver,
        },
        nextNode,
      };

      const args = ArgumentRuleRunner.generateArgumentsFromRules(node, [], passError);
      const [error, instance, surrogate] = args;

      expect(args).to.have.lengthOf(3);
      expect(error).to.equal(passError);
      expect(instance).to.equal(target);
      expect(surrogate).to.equal(receiver);
    });

    it('should run arguments with useNext: true, passInstance: true, passSurrogate: true, passErrors: true', () => {
      const options: SurrogateHandlerOptions<any> = {
        useNext: true,
        passErrors: true,
        passInstance: true,
        passSurrogate: true,
      };

      const passError = new Error('test');

      const node: any = {
        container: {
          options,
        },
        context: {
          target,
          receiver,
        },
        nextNode,
      };

      const args = ArgumentRuleRunner.generateArgumentsFromRules(node, [], passError);
      const [error, next, instance, surrogate] = args;

      expect(args).to.have.lengthOf(4);
      expect(error).to.equal(passError);
      expect(next).to.equal(nextNode);
      expect(instance).to.equal(target);
      expect(surrogate).to.equal(receiver);
    });
  });

  describe('With Arguments', () => {
    it('should run arguments with default options with args', () => {
      const options: SurrogateHandlerOptions<any> = {
        useNext: true,
        passErrors: false,
        passInstance: false,
        passSurrogate: false,
      };

      const node: any = {
        container: {
          options,
        },
        context: {
          target,
          receiver,
        },
        nextNode,
      };

      const args = ArgumentRuleRunner.generateArgumentsFromRules(node, ['this is an arg']);
      const [next, arg] = args;

      expect(args).to.have.lengthOf(2);
      expect(next).to.equal(nextNode);
      expect(arg).to.equal('this is an arg');
    });

    it('should run arguments with useNext: false with args', () => {
      const options: SurrogateHandlerOptions<any> = {
        useNext: false,
        passErrors: false,
        passInstance: false,
        passSurrogate: false,
      };

      const node: any = {
        container: {
          options,
        },
        context: {
          target,
          receiver,
        },
        nextNode,
      };
      const passedArgs = ['this is an arg'];

      const args = ArgumentRuleRunner.generateArgumentsFromRules(node, passedArgs);
      const [arg] = args;

      expect(args).to.equal(passedArgs);
      expect(args).to.have.lengthOf(1);
      expect(arg).to.equal('this is an arg');
    });
  });
});
