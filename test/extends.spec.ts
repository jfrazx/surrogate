import { SurrogateDelegate, SurrogatePre } from '../src';
import { Guitar } from './lib/guitar';
import * as sinon from 'sinon';

@SurrogateDelegate()
class BassGuitar extends Guitar {
  constructor() {
    super();
  }

  @SurrogatePre<BassGuitar>({
    handler: () => console.log('warming up'),
    options: {
      useNext: false,
    },
  })
  jam() {
    console.log('jamming with friends');
  }
}

describe('Inheritance', () => {
  let log: sinon.SinonStub<any, void>;

  afterEach(() => {
    sinon.restore();
  });

  beforeEach(() => {
    log = sinon.stub(console, 'log');
  });

  it('should inherit decorated methods', () => {
    const bassGuitar = new BassGuitar();

    bassGuitar.play();

    sinon.assert.callCount(log, 4);
  });

  it('should decorate new methods', () => {
    const bassGuitar = new BassGuitar();

    bassGuitar.jam();

    sinon.assert.callCount(log, 2);
  });
});
