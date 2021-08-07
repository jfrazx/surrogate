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

  it(`should run next decorators and surrogate decorators`, () => {
    const telemetry = new Telemetry();

    const trackEvent = sinon.spy(telemetry, 'trackEvent');

    const getClientHooks = telemetry.getSurrogate().getPreEventHandlers('getClient');

    expect(getClientHooks).have.lengthOf(1);
    expect(getClientRunCondition.callCount).to.equal(0);
    expect(bootstrapRunCondition.callCount).to.equal(0);
    expect(trackEvent.callCount).to.equal(0);

    telemetry.trackEvent({ name: 'test' });

    expect(trackEvent.callCount).to.equal(1);
    expect(getClientRunCondition.callCount).to.equal(1);
    expect(bootstrapRunCondition.callCount).to.equal(1);
  });
});
