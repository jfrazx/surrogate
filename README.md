# Surrogate

Easily create `Pre` and `Post` hooks on JavaScript objects.

## Install

Currently unpublished..

## Usage

There are a couple ways to manage Surrogate. The first is to utilize an exposed helper function, `wrapSurrogate`, to wrap objects and register pre and post methods through it.

```typescript
import { wrapSurrogate, Surrogate, INext } from 'some-future-package';

const guitar: Surrogate<Guitar> = wrapSurrogate(new Guitar(), options);

guitar.getSurrogate().registerPreHook('play', (next: INext<Guitar>) => {
  // do things before running 'play'

  next.next();
});
```

After wrapping your instance with Surrogate a new method is available, `getSurrogate`, which, when called will return  
an instance of Surrogate Event Manager that will allow management of pre and post methods.

### SurrogateEventManager Methods

registerHook(event: string, type: Which, handler: SurrogateHandler, options?: SurrogateHandlerOptions): SurrogateEventManager  
registerPreHook(event: string, handler: SurrogateHandler, options?: SurrogateHandlerOptions): SurrogateEventManager  
registerPostHook(event: string, handler: SurrogateHandler, options?: SurrogateHandlerOptions): SurrogateEventManager  
deregisterPreHooks(event: string): SurrogateEventManager  
deregisterPostHooks(event: string): SurrogateEventManager  
deregisterHooks(): SurrogateEventManager  
getEventHandlers(event: string): WhichContainers

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
  @SurrogatePost<Guitar>({
    handler: () => {
      console.log(`Put guitar away`);
    },
    options: {
      useNext: false,
    },
  })
  play() {
    console.log(`playing guitar`);
  }
}
```
