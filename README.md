# Surrogate

Easily create `Pre` and `Post` hooks on JavaScript objects.

## Install

Currently unpublished..

## Usage

There are a couple ways to manage Surrogate. The first is to utilize an exposed helper function, `wrapSurrogate`, to wrap objects  
and register pre and post methods through it.

```typescript
import { wrapSurrogate, Surrogate, INext } from 'some-future-package';

const instance: Surrogate<Guitar> = wrapSurrogate(new Guitar(), options);

instance.getSurrogate().registerPreHook('play', (next: INext<Guitar>) => {
  // do things before running 'play'

  next.next();
});
```

After wrapping your instance with Surrogate a new method is available, `getSurrogate`, which, when called will return  
an instance of Surrogate Event Manager that will allow management of pre and post methods.

### SurrogateEventManager Methods

registerHook(event: Property, type: Which, handler: SurrogateHandler, options?: SurrogateMethodOptions): SurrogateEventManager  
registerPreHook(event: Property, handler: SurrogateHandler, options?: SurrogateMethodOptions): SurrogateEventManager  
registerPostHook(event: Property, handler: SurrogateHandler, options?: SurrogateMethodOptions): SurrogateEventManager  
deregisterPreHooks(event: Property): SurrogateEventManager  
deregisterPostHooks(event: Property): SurrogateEventManager  
deregisterHooks(): SurrogateEventManager  
getEventHandlers(event: Property): WhichContainers

SurrogateHandler is any function that accepts a `Next` object which is used to control flow through pre and post hooks.

### Wrap Surrogate Options

useSingleton: boolean - informs Surrogate to operate as a Singleton -- default: `true`

## Decorators

Perhaps a more convenient way to register hooks is with decorators.

```typescript
import { SurrogateDelegate } from 'some-future-package';

@SurrogateDelegate()
class Guitar {}
```

`SurrogateDelegate` registers your class and will automatically wrap instances of the class with Surrogate.

Registering hooks:

```typescript
import { SurrogateDelegate, SurrogatePre, SurrogatePost, INext } from 'some-future-package';

@SurrogateDelegate()
class Guitar {
  @SurrogatePre((next: INext<Guitar>) => {
    console.log(`Tuning guitar`);

    next.next();
  })
  @SurrogatePost<Guitar>((next) => {
    console.log(`Put guitar away`);

    next.next();
  })
  play() {
    console.log(`playing guitar`);
  }
}
```

There may be times when you don't need a particular hook to run.

```typescript
import { SurrogateDelegate, SurrogatePre, SurrogatePost, INext } from 'some-future-package';

@SurrogateDelegate()
class Guitar {
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
    console.log(`playing guitar`);
  }
}
```
