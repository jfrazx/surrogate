import { SurrogateDelegate, SurrogatePre, INext } from '../src';

@SurrogateDelegate()
export class Animal {
  isSleeping = Math.random() > 0.5;

  @SurrogatePre({
    handler: (next: INext<Animal>) => {
      const { instance: animal } = next;

      next.next({
        bail: animal.isSleeping,
      });
    },
  })
  petAnimal() {
    console.log('petting animal');
  }
}
