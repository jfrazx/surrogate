import { SurrogateDelegate, NextPre, NextPreAndPost, SurrogateMethods } from '../src';
import * as sinon from 'sinon';
import { expect } from 'chai';

describe(`RegExpMethodMatching`, () => {
  beforeEach(() => {
    sinon.stub(console, 'error');
    sinon.stub(console, 'log');
  });

  afterEach(() => {
    sinon.restore();
  });

  it(`should match based on provided method name pattern`, () => {
    interface MatchTest extends SurrogateMethods<MatchTest> {}

    @SurrogateDelegate()
    class MatchTest {
      method1() {}
      method2() {}
      method3() {}

      notDecorated() {}

      @NextPre<MatchTest>({
        action: [`method*`],
      })
      protected log() {}
    }

    const test = new MatchTest();
    const eventManager = test.getSurrogate();

    ['method1', 'method2', 'method3'].forEach((methodName) => {
      const preHooks = eventManager.getPreEventHandlers(methodName);
      const postHooks = eventManager.getPostEventHandlers(methodName);

      expect(preHooks).to.have.lengthOf(1);
      expect(postHooks).to.have.lengthOf(0);
    });

    const preHooks = eventManager.getPreEventHandlers('notDecorated');
    const postHooks = eventManager.getPostEventHandlers('notDecorated');

    expect(preHooks).to.have.lengthOf(0);
    expect(postHooks).to.have.lengthOf(0);
  });

  it(`should match bracket patterns`, () => {
    interface MatchTest extends SurrogateMethods<MatchTest> {}

    @SurrogateDelegate()
    class MatchTest {
      a() {}

      ab() {}
      abc() {}
      dbc() {}

      @NextPreAndPost<MatchTest>({
        action: [`[a-d]{2}`],
      })
      protected log() {}
    }

    const test = new MatchTest();
    const eventManager = test.getSurrogate();

    ['dbc', 'abc', 'ab'].forEach((methodName) => {
      const preHooks = eventManager.getPreEventHandlers(methodName);
      const postHooks = eventManager.getPostEventHandlers(methodName);

      expect(preHooks).to.have.lengthOf(1);
      expect(postHooks).to.have.lengthOf(1);
    });

    const preHooks = eventManager.getPreEventHandlers('a');
    const postHooks = eventManager.getPostEventHandlers('a');

    expect(preHooks).to.have.lengthOf(0);
    expect(postHooks).to.have.lengthOf(0);
  });

  it(`should normally match a generator`, () => {
    interface MatchTest extends SurrogateMethods<MatchTest> {}

    @SurrogateDelegate()
    class MatchTest {
      *a() {}

      ab() {}
      abc() {}
      dbc() {}

      @NextPreAndPost<MatchTest>({
        action: [`a`],
      })
      log() {}
    }

    const test = new MatchTest();
    const eventManager = test.getSurrogate();

    ['dbc', 'abc', 'ab'].forEach((methodName) => {
      const preHooks = eventManager.getPreEventHandlers(methodName);
      const postHooks = eventManager.getPostEventHandlers(methodName);

      expect(preHooks).to.have.lengthOf(0);
      expect(postHooks).to.have.lengthOf(0);
    });

    const preHooks = eventManager.getPreEventHandlers('a');
    const postHooks = eventManager.getPostEventHandlers('a');

    expect(preHooks).to.have.lengthOf(1);
    expect(postHooks).to.have.lengthOf(1);
  });
});
