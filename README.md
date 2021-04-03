# Surrogate

Easily create `Pre` and `Post` hooks on JavaScript objects.

## Install

`npm install surrogate`

or

`yarn add surrogate`

## Usage

There are a couple ways to manage Surrogate. The first is to utilize an exposed helper function, `wrapSurrogate`, to wrap objects and register pre and post methods through it.

```typescript
import { wrapSurrogate, Surrogate, INext } from 'surrogate';

const guitar: Surrogate<Guitar> = wrapSurrogate(new Guitar(), options);

guitar.getSurrogate().registerPreHook('play', (next: INext<Guitar>) => {
  // do things before running 'play'

  next.next();
});
```

After wrapping your instance with Surrogate a new method is available, `getSurrogate`, which, when called will return an instance of Surrogate Event Manager that will allow management of pre and post methods.

### SurrogateEventManager Methods

registerPreHook(event: string, handler: SurrogateHandler, options?: SurrogateHandlerOptions): SurrogateEventManager  
registerPostHook(event: string, handler: SurrogateHandler, options?: SurrogateHandlerOptions): SurrogateEventManager  
deregisterPreHooks(event: string): SurrogateEventManager  
deregisterPostHooks(event: string): SurrogateEventManager  
deregisterHooks(): SurrogateEventManager  
getEventHandlers(event: string): WhichContainers

SurrogateHandler is any function that accepts a `Next` object which is used to control flow through pre and post hooks.

### Wrap Surrogate Options

useSingleton: boolean - informs Surrogate to operate as a Singleton -- default: `true`

### Next Object

`Next` is passed by default to all hook handlers. It can supply the unwrapped or surrogate wrapped instance to the current handler and provides functionality to skip hooks or continue to the next hook for execution.

action: string :: A property that provides the current action or method target.  
hookType: string :: A property that provides the current hook type as a string.  
instance: T :: A property that provides access to the unwrapped instance.  
surrogate: Surrogate\<T\> :: A property that provides access to the surrogate wrapped instance.  
skip(skipAmount?: number): Method that will skip the next 'skipAmount' handlers -- default: `1`  
skipWith(skipAmount?: number, ...args: any[]): Same as `skip` but will accept any number of arguments, passing to the next executed handler  
next(nextOptions?: NextOptions): Calling next may advance to the next hook.

#### Next Options

error?:Error :: Passing an Error may result in the error being thrown, depending on supplied handler options  
using?: any[] :: An array of values to pass to the next handler  
bail?: boolean :: Indicates all subsequent handler executions should stop immediately. Target method is not called.  
bailWith?: any :: If bailing, the supplied value should be returned

## Decorators

Perhaps a more convenient way to register hooks is with decorators.

```typescript
import { SurrogateDelegate } from 'surrogate';

@SurrogateDelegate()
class Guitar {}
```

`SurrogateDelegate` registers your class and will automatically wrap instances of the class with Surrogate.

Registering hooks:

```typescript
import { INext, SurrogatePre, SurrogatePost, SurrogateDelegate } from 'surrogate';

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

## Acknowledgements

Many thanks to [Dale](https://github.com/divmain) for transferring the npm package name.
