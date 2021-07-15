import { wrapSurrogate, Surrogate, NextHandler } from '../src';
import { Network } from './lib/network';
import * as sinon from 'sinon';
import { expect } from 'chai';
import {
  NodeTimeTracker,
  BrowserTimeTracker,
  DefaultTimeTracker,
} from '../src/timeTracker/trackers';

describe('TimeTracking', () => {
  let clock: sinon.SinonFakeTimers;
  let network: Surrogate<Network>;

  const wait = (ms: number) =>
    new Promise((resolve) => {
      setTimeout(resolve, ms);
      clock.tick(ms + 1);
    });

  beforeEach(() => {
    network = wrapSurrogate(new Network());
    clock = sinon.useFakeTimers();
    sinon.stub(console, 'error');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should pass NodeTimeTracker', async () => {
    const serverName = 'server name node time tracker';
    let elapsedTime: number;

    network
      .getSurrogate()
      .registerPreHook('checkServerAsync', [
        ({ timeTracker, next }: NextHandler<Network>) => {
          elapsedTime = timeTracker.getTotalDuration();

          expect(timeTracker).to.be.instanceOf(NodeTimeTracker);
          expect(timeTracker.getTotalDuration()).to.be.a('number');

          setTimeout(() => next.next(), 100);

          clock.tick(200);
        },
      ])
      .registerPostHook(
        'checkServerAsync',
        async ({ timeTracker }: NextHandler<Network>) => {
          clock.tick(123);

          expect(timeTracker).to.be.instanceOf(NodeTimeTracker);
          expect(timeTracker.getTotalDuration()).to.be.a('number');
          expect(timeTracker.getTotalDuration()).to.be.greaterThan(elapsedTime);
          expect(timeTracker.getDurationSinceLastRun()).to.be.a('number');
        },
        { useNext: false, wrapper: 'async' },
      );

    const name = await network.checkServerAsync(serverName);

    expect(name).to.equal(serverName);
  });

  it('should pass BrowserTimeTracker', async () => {
    global.window = { performance: { now: () => Date.now() } } as any;
    const serverName = 'server name browser time tracker';
    let elapsedTime: number;

    network
      .getSurrogate()
      .registerPreHook('checkServerAsync', [
        ({ timeTracker, next }: NextHandler<Network>) => {
          elapsedTime = timeTracker.getTotalDuration();

          expect(timeTracker).to.be.instanceOf(BrowserTimeTracker);
          expect(timeTracker.getTotalDuration()).to.be.a('number');

          setTimeout(() => next.next(), 100);

          clock.tick(200);
        },
      ])
      .registerPostHook(
        'checkServerAsync',
        async ({ timeTracker }: NextHandler<Network>) => {
          clock.tick(123);

          expect(timeTracker).to.be.instanceOf(BrowserTimeTracker);
          expect(timeTracker.getTotalDuration()).to.be.a('number');
          expect(timeTracker.getTotalDuration()).to.be.greaterThan(elapsedTime);
          expect(timeTracker.getDurationSinceLastRun()).to.be.a('number');
        },
        { useNext: false, wrapper: 'async' },
      );

    const name = await network.checkServerAsync(serverName);

    expect(name).to.equal(serverName);

    global.window = null;
  });

  it('should pass DefaultTimeTracker', async () => {
    const hrtime = process.hrtime;

    process.hrtime = null;

    const serverName = 'server name default time tracker';
    let elapsedTime: number;

    network
      .getSurrogate()
      .registerPreHook('checkServerAsync', [
        ({ timeTracker, next }: NextHandler<Network>) => {
          elapsedTime = timeTracker.getTotalDuration();

          expect(timeTracker).to.be.instanceOf(DefaultTimeTracker);
          expect(timeTracker.getTotalDuration()).to.be.a('number');

          setTimeout(() => next.next(), 100);

          clock.tick(200);
        },
      ])
      .registerPostHook(
        'checkServerAsync',
        async ({ timeTracker }: NextHandler<Network>) => {
          clock.tick(123);

          expect(timeTracker).to.be.instanceOf(DefaultTimeTracker);
          expect(timeTracker.getTotalDuration()).to.be.a('number');
          expect(timeTracker.getTotalDuration()).to.be.greaterThan(elapsedTime);
          expect(timeTracker.getDurationSinceLastRun()).to.be.a('number');
        },
        { useNext: false, wrapper: 'async' },
      );

    const name = await network.checkServerAsync(serverName);

    expect(name).to.equal(serverName);

    process.hrtime = hrtime;
  });

  it('should create a browser time tracker', () => {
    global.window = { performance: { now: () => Date.now() } } as any;

    const timeTracker = new BrowserTimeTracker();

    expect(timeTracker).to.be.instanceOf(BrowserTimeTracker);
  });

  it('should create a default time tracker', () => {
    const timeTracker = new DefaultTimeTracker();

    expect(timeTracker).to.be.instanceOf(DefaultTimeTracker);
  });

  it('should start with 0 time passed', () => {
    const timeTracker = new DefaultTimeTracker();

    expect(timeTracker.getTotalDuration()).to.equal(0);
    expect(timeTracker.getDurationSinceLastRun()).to.equal(0);
  });

  it('should give the same results', async () => {
    const defaultTracker = new DefaultTimeTracker();
    const nodeTracker = new NodeTimeTracker();

    expect(defaultTracker.lastRunStart).to.equal(nodeTracker.lastRunStart);

    await wait(50);

    defaultTracker.setHookStart();
    nodeTracker.setHookStart();

    await wait(150);

    defaultTracker.setHookEnd();
    nodeTracker.setHookEnd();

    expect(defaultTracker.getHookStartTime()).to.be.within(
      nodeTracker.getHookStartTime() - 1,
      nodeTracker.getHookStartTime() + 1,
    );

    await wait(97);

    expect(defaultTracker.getLastRunDuration()).to.be.within(
      nodeTracker.getLastRunDuration() - 1,
      nodeTracker.getLastRunDuration() + 1,
    );

    await wait(170);

    expect(defaultTracker.getStartTime()).to.be.within(
      nodeTracker.getStartTime() - 1,
      nodeTracker.getStartTime() + 1,
    );

    await wait(340.45);

    expect(defaultTracker.getTotalDuration()).to.be.within(
      nodeTracker.getTotalDuration() - 1,
      nodeTracker.getTotalDuration() + 1,
    );

    await wait(20.56);

    expect(defaultTracker.getDurationSinceLastRun()).to.be.within(
      nodeTracker.getDurationSinceLastRun() - 1,
      nodeTracker.getDurationSinceLastRun() + 1,
    );
  });
});
