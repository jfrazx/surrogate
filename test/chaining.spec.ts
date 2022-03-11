import { Telemetry, getClientRunCondition, bootstrapRunCondition } from './lib/telemetry';
import * as sinon from 'sinon';
import { expect } from 'chai';

describe(`Chaining`, () => {
  beforeEach(() => {
    sinon.stub(console, 'log');
  });

  afterEach(() => {
    sinon.restore();
  });

  it.skip(`should run next decorators and surrogate decorators`, () => {
    const telemetry = new Telemetry();
    const manager = telemetry.getSurrogate();

    const trackEventHooks = manager.getPreEventHandlers('trackEvent');
    const getClientHooks = manager.getPreEventHandlers('getClient');
    const redactHooks = manager.getPostEventHandlers('redact');

    const trackEvent = sinon.spy(telemetry, 'trackEvent');
    const redact = sinon.spy(telemetry, 'redact' as any);

    expect(redactHooks).have.lengthOf(1);
    expect(getClientHooks).have.lengthOf(1);
    expect(trackEventHooks).have.lengthOf(1);
    expect(getClientRunCondition.callCount).to.equal(0);
    expect(bootstrapRunCondition.callCount).to.equal(0);
    expect(trackEvent.callCount).to.equal(0);

    telemetry.trackEvent({ name: 'test' });

    expect(redact.callCount).to.equal(1);
    expect(trackEvent.callCount).to.equal(1);
    expect(getClientRunCondition.callCount).to.equal(1);
    expect(bootstrapRunCondition.callCount).to.equal(1);
  });
});
