import {
  INext,
  NextFor,
  POST_HOOK,
  Surrogate,
  SurrogatePre,
  SurrogatePost,
  SurrogateDelegate,
} from '../../src';

interface IThing {}
export interface Thing extends Surrogate<IThing> {}

@SurrogateDelegate()
// @ts-ignore
export class Thing {
  @SurrogatePre<Thing>([
    (next) => {
      console.log('doing thing before connect');
      next.next();
    },
  ])
  @SurrogatePost({
    handler: (next: INext<Thing>) => {
      console.log('this is post connect');

      next.next();
    },
  })
  connect() {
    console.log('i am connect');
  }

  @NextFor({ type: POST_HOOK, action: 'connect' })
  postConnect(next: INext<this>) {
    console.log('post connect method');
  }
}
