import {
  POST,
  NextFor,
  NextParameters,
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
      handler: ({ next, instance }: NextParameters<Guitar>) => {
        console.log('stringing instrument');

        instance.isStrung = true;

        next.next();
      },
      options: {
        runConditions: [({ instance: guitar }) => !guitar.isStrung],
      },
    },
    {
      handler: ({ next, instance: guitar }: NextParameters<Guitar>) => {
        console.log('tuning instrument');

        guitar.isTuned = true;

        next.next({
          bail: guitar.hasBrokenString,
        });
      },
      options: {
        runConditions: ({ instance: guitar }) => !guitar.isTuned,
      },
    },
  ])
  @SurrogatePost({
    handler: ({ next }: NextParameters<Guitar>) => {
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
      runConditions: ({ instance: guitar }) => guitar.hasBrokenString,
    },
  })
  postPlay({ next, instance }: NextParameters<this>) {
    console.log('fixing broken string');

    instance.hasBrokenString = false;
    instance.isTuned = false;

    next.next();
  }
}
