import {
  POST,
  NextFor,
  NextHandler,
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
      handler: ({ next }: NextHandler<Guitar>) => {
        console.log('stringing instrument');

        next.instance.isStrung = true;

        next.next();
      },
      options: {
        runConditions: [(guitar) => !guitar.isStrung],
      },
    },
    {
      handler: ({ next, instance: guitar }: NextHandler<Guitar>) => {
        console.log('tuning instrument');

        guitar.isTuned = true;

        next.next({
          bail: guitar.hasBrokenString,
        });
      },
      options: {
        runConditions: (guitar) => !guitar.isTuned,
      },
    },
  ])
  @SurrogatePost({
    handler: ({ next }: NextHandler<Guitar>) => {
      console.log('celebrate rocking out');

      next.next();
    },
  })
  play() {
    console.log('playing instrument');
  }

  @NextFor<Guitar>({
    type: POST,
    action: ['play'],
    options: {
      runConditions: (guitar) => guitar.hasBrokenString,
    },
  })
  postPlay({ next }: NextHandler<this>) {
    const { instance } = next;
    console.log('fixing broken string');

    instance.hasBrokenString = false;
    instance.isTuned = false;

    next.next();
  }
}
