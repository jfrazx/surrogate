import {
  INext,
  NextFor,
  POST_HOOK,
  Surrogate,
  SurrogatePre,
  SurrogatePost,
  SurrogateDelegate,
} from '../../src';

interface IGuitar {}
export interface Guitar extends Surrogate<IGuitar> {}

@SurrogateDelegate()
// @ts-ignore
export class Guitar {
  isTuned = false;
  isStrung = false;
  hasBrokenString = false;

  @SurrogatePre<Guitar>([
    {
      handler: (next) => {
        console.log('stringing guitar');

        next.instance.isStrung = true;

        next.next();
      },
      options: {
        runConditions: [(guitar) => !guitar.isStrung],
      },
    },

    {
      handler: (next) => {
        const { instance } = next;
        console.log('tuning guitar');

        instance.isTuned = true;

        next.next({
          bail: instance.hasBrokenString,
        });
      },
      options: {
        runConditions: [(guitar) => !guitar.isTuned],
      },
    },
  ])
  @SurrogatePost({
    handler: (next: INext<Guitar>) => {
      console.log('celebrate rocking out');

      next.next();
    },
  })
  play() {
    console.log('playing guitar');
  }

  @NextFor<Guitar>({
    type: POST_HOOK,
    action: 'play',
    options: {
      runConditions: (guitar) => guitar.hasBrokenString,
    },
  })
  postPlay(next: INext<this>) {
    const { instance } = next;
    console.log('fixing broken string');

    instance.hasBrokenString = false;
    instance.isTuned = false;

    next.next();
  }
}
