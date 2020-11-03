import { SurrogateDelegate, SurrogatePre, SurrogatePost } from '../src';
import { Guitar } from './lib/guitar';
import { expect } from 'chai';

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
});
