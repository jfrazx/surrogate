import { isAsync, isPromiseLike } from '../src/helpers';
import { expect } from 'chai';

describe('Helpers', () => {
  it('should return true if it is an async method', () => {
    class Network {
      async connect() {}
    }

    const network = new Network();

    expect(isAsync(network.connect)).to.be.true;
  });

  it('should return true if it is an async function', () => {
    expect(isAsync(async () => {})).to.be.true;
  });

  it('should return false if it is not an async method', () => {
    class Network {
      connect() {}
    }

    const network = new Network();

    expect(isAsync(network.connect)).to.be.false;
  });

  it('should return false if it is not an async function', () => {
    expect(isAsync(() => {})).to.be.false;
  });

  it('should return true if it is a promise', () => {
    expect(isPromiseLike(new Promise(() => {}))).to.be.true;
  });

  it('should return true if it has a "then" method', () => {
    expect(
      isPromiseLike({
        then: () => {},
      }),
    ).to.be.true;
  });

  it('should return false if it is not a promise', () => {
    expect(isPromiseLike(() => {})).to.be.false;
  });

  it('should return false if it does not have a "then" method', () => {
    expect(
      isPromiseLike({
        hen: () => {},
      }),
    ).to.be.false;
  });

  it('should return false if it is null', () => {
    expect(isPromiseLike(null)).to.be.false;
  });
});
