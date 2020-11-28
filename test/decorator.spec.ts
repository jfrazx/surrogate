import { Guitar } from './lib/guitar';
import { expect } from 'chai';
import sinon from 'sinon';
import {
  INext,
  NextFor,
  NextPre,
  NextPost,
  NextAsyncPre,
  SurrogatePre,
  NextAsyncPost,
  SurrogatePost,
  SurrogateAsyncPre,
  SurrogateDelegate,
  SurrogateAsyncPost,
  SurrogateHandler,
} from '../src';

describe('SurrogateDecorators', () => {
  describe('SurrogateDelegate', () => {
    it('should be a function', () => {
      expect(SurrogateDelegate).to.be.a('function');
    });
  });

  describe('SurrogatePre', () => {
    it('should be a function', () => {
      expect(SurrogatePre).to.be.a('function');
    });

    it('should run pre hooks', () => {
      const guitar = new Guitar();

      guitar.play();
    });

    it('should pre decorate a synchronous method', () => {
      const handler: SurrogateHandler<Test> = sinon.spy((next: INext<Test>) =>
        next.next(),
      ) as any;
      const results = 'SurrogatePre';

      @SurrogateDelegate()
      class Test {
        @SurrogatePre<Test>(handler)
        method() {
          return results;
        }
      }

      const test = new Test();

      const result = test.method();

      sinon.assert.called(handler as any);
      expect(result).to.equal(results);
    });
  });

  describe('SurrogatePost', () => {
    it('should be a function', () => {
      expect(SurrogatePost).to.be.a('function');
    });

    it('should post decorate a synchronous method', () => {
      const handler: SurrogateHandler<Test> = sinon.spy((next: INext<Test>) =>
        next.next(),
      ) as any;
      const results = 'SurrogatePost';

      @SurrogateDelegate()
      class Test {
        @SurrogatePost<Test>(handler)
        method() {
          return results;
        }
      }

      const test = new Test();

      const result = test.method();

      sinon.assert.called(handler as any);
      expect(result).to.equal(results);
    });
  });

  describe('SurrogateAsyncPost', () => {
    it('should be a function', () => {
      expect(SurrogateAsyncPost).to.be.a('function');
    });

    it('should post decorate an async method', async () => {
      const handler: SurrogateHandler<Test> = sinon.spy((next: INext<Test>) =>
        next.next(),
      ) as any;
      const results = 'SurrogateAsyncPost';

      @SurrogateDelegate()
      class Test {
        @SurrogateAsyncPost<Test>(handler)
        async method() {
          return results;
        }
      }

      const test = new Test();

      const result = await test.method();

      sinon.assert.called(handler as any);
      expect(result).to.equal(results);
    });
  });

  describe('SurrogateAsyncPre', () => {
    it('should be a function', () => {
      expect(SurrogateAsyncPre).to.be.a('function');
    });

    it('should pre decorate an async method', async () => {
      const handler: SurrogateHandler<Test> = sinon.spy((next: INext<Test>) =>
        next.next(),
      ) as any;
      const results = 'SurrogateAsyncPre';

      @SurrogateDelegate()
      class Test {
        @SurrogateAsyncPre<Test>(handler)
        async method() {
          return results;
        }
      }

      const test = new Test();

      const result = await test.method();

      sinon.assert.called(handler as any);
      expect(result).to.equal(results);
    });
  });

  describe('NextFor', () => {
    it('should be a function', () => {
      expect(NextFor).to.be.a('function');
    });
  });

  describe('NextPre', () => {
    it('should be a function', () => {
      expect(NextPre).to.be.a('function');
    });
  });

  describe('NextPost', () => {
    it('should be a function', () => {
      expect(NextPost).to.be.a('function');
    });
  });

  describe('NextAsyncPost', () => {
    it('should be a function', () => {
      expect(NextAsyncPost).to.be.a('function');
    });
  });

  describe('NextAsyncPre', () => {
    it('should be a function', () => {
      expect(NextAsyncPre).to.be.a('function');
    });
  });
});
