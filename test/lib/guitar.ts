import {
  POST,
  INext,
  NextFor,
  SurrogatePre,
  SurrogatePost,
  SurrogateMethods,
  SurrogateDelegate,
} from '../../src';

export interface Guitar extends SurrogateMethods<Guitar> {}

@SurrogateDelegate()
export class Guitar {
  isTuned = false;
  isStrung = false;
  hasBrokenString = false;

  @SurrogatePre<Guitar>([
    {
      handler: (next: INext<Guitar>) => {
        console.log('stringing guitar');

        next.instance.isStrung = true;

        next.next();
      },
      options: {
        runConditions: [(guitar) => !guitar.isStrung],
      },
    },
    {
      handler: (next: INext<Guitar>, guitar: Guitar) => {
        console.log('tuning guitar');

        guitar.isTuned = true;

        next.next({
          bail: guitar.hasBrokenString,
        });
      },
      options: {
        passInstance: true,
        runConditions: (guitar) => !guitar.isTuned,
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
    type: POST,
    action: ['play'],
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
