import { SurrogateDelegate, SurrogatePre, INext, NextPost } from '../build';

@SurrogateDelegate()
export class Animal {
  isSleeping = Math.random() > 0.5;
  mayBeFed = Math.random() > 0.6;

  @SurrogatePre<Animal>([
    {
      handler: (next: INext<Animal>) => {
        const { instance: animal } = next;

        next.next({
          bail: animal.isSleeping,
        });
      },
    },
  ])
  pet() {
    console.log('petting animal');
  }

  @NextPost<Animal>({
    action: ['pet'],
    options: {
      runConditions: (animal) => animal.mayBeFed,
    },
  })
  feed(next: INext<Animal>) {
    console.log('Feeding animal');

    const animalBitesHand = Math.random() < 0.2;

    next.next({
      error: animalBitesHand ? new Error(`Ouch`) : false,
    });
  }
}

const animal = new Animal();

console.log(animal);

animal.pet();
