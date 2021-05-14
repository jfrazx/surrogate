import {
  NextPost,
  NextHandler,
  SurrogatePre,
  SurrogateMethods,
  SurrogateDelegate,
} from '../build';

export interface Animal extends SurrogateMethods<Animal> {}

@SurrogateDelegate()
export class Animal {
  isSleeping = Math.random() > 0.5;
  mayBeFed = Math.random() > 0.6;

  @SurrogatePre<Animal>([
    {
      handler: ({ next, instance: animal }: NextHandler<Animal>) => {
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
      runConditions: ({ instance: animal }) => animal.mayBeFed,
    },
  })
  feed({ next }: NextHandler<Animal>) {
    console.log('Feeding animal');

    const animalBitesHand = Math.random() < 0.2;

    next.next({
      error: animalBitesHand ? new Error(`Ouch`) : null,
    });
  }
}

const animal = new Animal();

console.log(animal);

animal.pet();
