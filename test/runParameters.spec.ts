import { SurrogateContext, SurrogateMethods, SurrogateDelegate, SurrogatePre } from '../src';
import { RunConditionProvider } from '../src/provider/runCondition';
import { Trackable } from '../src/timeTracker/trackable';
import * as sinon from 'sinon';
import { expect } from 'chai';

describe('RunParameters', () => {
  const sandbox = sinon.createSandbox();

  it('should run before provided handler', () => {
    const handler = sandbox.spy();
    const someValue = 'someValue';
    const runCondition = sandbox.stub().returns(true);

    @SurrogateDelegate()
    class RunBeforeHandler {
      @SurrogatePre<RunBeforeHandler>({
        handler,
        options: {
          runConditions: [runCondition],
          useNext: false,
        },
      })
      runs() {
        return someValue;
      }
    }

    const runner = new RunBeforeHandler();
    const result = runner.runs();

    sandbox.assert.calledOnce(handler);
    sandbox.assert.calledOnce(runCondition);

    expect(result).to.equal(someValue);
    expect(runCondition.calledBefore(handler)).to.be.true;
  });

  it('should determine a handler will not run', () => {
    const handler = sandbox.spy();
    const someValue = 'someValue';
    const runCondition = sandbox.stub().returns(false);

    @SurrogateDelegate()
    class RunBeforeHandler {
      @SurrogatePre<RunBeforeHandler>({
        handler,
        options: {
          runConditions: [runCondition],
          useNext: false,
        },
      })
      runs() {
        return someValue;
      }
    }

    const runner = new RunBeforeHandler();
    const result = runner.runs();

    sandbox.assert.notCalled(handler);
    sandbox.assert.calledOnce(runCondition);

    expect(result).to.equal(someValue);
    expect(runCondition.calledBefore(handler)).to.be.true;
  });

  it('should run before the decorated method', () => {
    const handler = sandbox.spy();
    const someValue = 'someValue';
    const runCondition = sandbox.stub().returns(true);

    @SurrogateDelegate()
    class RunBeforeMethod {
      @SurrogatePre<RunBeforeMethod>({
        handler,
        options: {
          runConditions: [runCondition],
          useNext: false,
        },
      })
      runs() {
        return someValue;
      }
    }

    const runner = new RunBeforeMethod();
    const stubbed = sandbox.stub(runner, 'runs').returns(someValue);
    const result = runner.runs();

    sandbox.assert.calledOnce(handler);
    sandbox.assert.calledOnce(stubbed);
    sandbox.assert.calledOnce(runCondition);

    expect(result).to.equal(someValue);
    expect(stubbed.calledImmediatelyAfter(handler)).to.be.true;
    expect(handler.calledImmediatelyBefore(stubbed)).to.be.true;
    expect(handler.calledImmediatelyAfter(runCondition)).to.be.true;
    expect(runCondition.calledImmediatelyBefore(handler)).to.be.true;
  });

  it('should run in the objects context', () => {
    const handler = sandbox.spy();
    const someValue = 'someValue';
    const runCondition = sandbox.stub().returns(true);

    interface RunInContext extends SurrogateMethods<RunInContext> {}

    @SurrogateDelegate()
    class RunInContext {
      @SurrogatePre<RunInContext>({
        handler,
        options: {
          runConditions: [runCondition],
          useNext: false,
        },
      })
      runs() {
        return someValue;
      }
    }

    const runner = new RunInContext();
    const result = runner.runs();

    sandbox.assert.calledOnce(handler);
    sandbox.assert.calledOnce(runCondition);

    expect(result).to.equal(someValue);
    expect(runCondition.calledOn(runner.bypassSurrogate())).to.be.true;
  });

  it('should run in the context of surrogate', () => {
    const handler = sandbox.spy();
    const someValue = 'someValue';
    const runCondition = sandbox.stub().returns(true);

    @SurrogateDelegate({ useContext: SurrogateContext.Surrogate })
    class RunInSurrogate {
      @SurrogatePre<RunInSurrogate>({
        handler,
        options: {
          runConditions: [runCondition],
          useNext: false,
        },
      })
      runs() {
        return someValue;
      }
    }

    const runner = new RunInSurrogate();
    const result = runner.runs();

    sandbox.assert.calledOnce(handler);
    sandbox.assert.calledOnce(runCondition);

    expect(result).to.equal(someValue);
    expect(runCondition.calledOn(runner)).to.be.true;
  });

  it('should receive run a condition provider object', () => {
    const handler = sandbox.spy();
    const someValue = 'someValue';
    const runCondition = sandbox.stub().returns(true);

    @SurrogateDelegate()
    class RunConditionProviderTest {
      @SurrogatePre<RunConditionProviderTest>({
        handler,
        options: {
          runConditions: [runCondition],
          useNext: false,
        },
      })
      runs() {
        return someValue;
      }
    }

    const runner = new RunConditionProviderTest();
    const result = runner.runs();

    const call = runCondition.getCall(0);

    sandbox.assert.calledOnce(handler);
    sandbox.assert.calledOnce(runCondition);

    expect(result).to.equal(someValue);
    expect(call.args[0]).to.be.instanceOf(RunConditionProvider);
  });

  it('should have run condition provider values', () => {
    const handler = sandbox.spy();
    const someValue = 'someValue';
    const runCondition = sandbox.stub().returns(true);

    interface RunConditionProviderTest extends SurrogateMethods<RunConditionProviderTest> {}

    @SurrogateDelegate()
    class RunConditionProviderTest {
      @SurrogatePre<RunConditionProviderTest>({
        handler,
        options: {
          runConditions: [runCondition],
          useNext: false,
        },
      })
      runs() {
        return someValue;
      }
    }

    const runner = new RunConditionProviderTest();
    const result = runner.runs();

    const [provider]: RunConditionProvider<RunConditionProviderTest>[] =
      runCondition.getCall(0).args;

    expect(result).to.equal(someValue);
    expect(provider.didError).to.be.false;
    expect(provider.error).to.be.undefined;
    expect(provider.result).to.be.undefined;
    expect(provider.action).to.equal('runs');
    expect(provider.hookType).to.equal('pre');
    expect(provider.correlationId).to.be.a.string;
    expect(provider.currentArgs).to.be.an('array');
    expect(provider.currentArgs).to.have.lengthOf(0);
    expect(provider.valueFromCondition).to.be.undefined;
    expect(provider.didReceiveFromLastCondition).to.be.false;
    expect(provider.timeTracker).to.be.instanceOf(Trackable);
    expect(provider.instance).to.equal(runner.bypassSurrogate());
    expect(provider.currentArgs).to.equal(provider.originalArgs);
  });

  it('should pass values between run conditions', () => {
    const handler = sandbox.spy();
    const someValue = 'someValue';
    const runCondition = sandbox.stub().returns(true);
    const runConditionPassingValue = 'run condition passing';

    @SurrogateDelegate()
    class RunConditionProviderTest {
      @SurrogatePre<RunConditionProviderTest>({
        handler,
        options: {
          runConditions: [
            (runProvider) => {
              runProvider.passToNextCondition(runConditionPassingValue);

              return true;
            },
            runCondition,
          ],
          useNext: false,
        },
      })
      runs() {
        return someValue;
      }
    }

    const runner = new RunConditionProviderTest();
    const result = runner.runs();

    const [provider]: RunConditionProvider<RunConditionProviderTest>[] =
      runCondition.getCall(0).args;

    expect(result).to.equal(someValue);
    expect((provider as any).valuesFromConditions).to.have.lengthOf(2);
    expect((provider as any).valuesFromConditions).to.include(runConditionPassingValue);
  });
});
