import { SurrogateDelegate, SurrogatePre, SurrogatePost } from '../src';
import { expect } from 'chai';
import { Thing } from './lib/thing';

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
      const thing = new Thing();

      thing.connect();
    });
  });

  describe('SurrogatePost', () => {
    it('should be a function', () => {
      expect(SurrogatePost).to.be.a('function');
    });
  });
});