import { Telemetry, getClientRunCondition, bootstrapRunCondition } from './lib/telemetry';
import { NextParameters } from '../src';
import * as sinon from 'sinon';
import { expect } from 'chai';

describe(`Chaining`, () => {
  const sandbox = sinon.createSandbox();

  beforeEach(() => {
    sandbox.stub(console, 'log');
  });

  afterEach(() => {
    sandbox.restore();
  });

  it(`should run next decorators and surrogate decorators`, () => {
    const telemetry = new Telemetry();
    const manager = telemetry.getSurrogate();

    const properties = {
      password: 'password',
      somethingElse: 'stuff',
    };

    const content = { exception: new Error('test'), properties };

    const trackExceptionHooks = manager.getPreEventHandlers('trackException');
    const getClientHooks = manager.getPreEventHandlers('getClient');
    const redactHooks = manager.getPostEventHandlers('redact');

    const trackException = sandbox.spy(telemetry, 'trackException');
    const redact = sandbox.spy(telemetry, 'redact' as any);

    expect(redactHooks).have.lengthOf(0);
    expect(getClientHooks).have.lengthOf(1);
    expect(trackExceptionHooks).have.lengthOf(2);
    expect(trackException.callCount).to.equal(0);
    expect(getClientRunCondition.callCount).to.equal(0);
    expect(bootstrapRunCondition.callCount).to.equal(0);

    telemetry.trackException(content);

    sandbox.assert.called(redact);
    sandbox.assert.calledOnce(trackException);
    sandbox.assert.calledOnce(getClientRunCondition);
    sandbox.assert.calledOnce(bootstrapRunCondition);

    const [redactParameters] = redact.firstCall.args as NextParameters<Telemetry>[];
    const [receivedParameters] = trackException.firstCall.args;

    expect(redactParameters.originalArgs).to.deep.equal([content]);
    expect(receivedParameters).to.deep.equal({
      ...content,
      properties: { ...properties, password: '[REDACTED]' },
    });
  });
});
