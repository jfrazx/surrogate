import { Guitar } from './lib/guitar';
import { expect } from 'chai';
import {
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
  });

  describe('SurrogatePost', () => {
    it('should be a function', () => {
      expect(SurrogatePost).to.be.a('function');
    });
  });

  describe('SurrogateAsyncPost', () => {
    it('should be a function', () => {
      expect(SurrogateAsyncPost).to.be.a('function');
    });
  });

  describe('SurrogateAsyncPre', () => {
    it('should be a function', () => {
      expect(SurrogateAsyncPre).to.be.a('function');
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
