import { SurrogateDelegate, SurrogatePre } from '../src';
import { Guitar } from './lib/guitar';
import * as sinon from 'sinon';

@SurrogateDelegate()
class BassGuitar extends Guitar {
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
  const sandbox = sinon.createSandbox();
  let log: sinon.SinonStub<any, void>;

  afterEach(() => {
    sandbox.restore();
  });

  beforeEach(() => {
    log = sandbox.stub(console, 'log');
  });

  it('should inherit decorated methods', () => {
    const bassGuitar = new BassGuitar();

    bassGuitar.play();

    sandbox.assert.callCount(log, 4);
  });

  it('should decorate new methods', () => {
    const bassGuitar = new BassGuitar();

    bassGuitar.jam();

    sandbox.assert.callCount(log, 2);
  });
});
