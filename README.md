# Surrogate

Easily create `Pre` and `Post` hooks on JavaScript objects.

## Install

`npm install surrogate`

or

`yarn add surrogate`

## Usage

There are a couple ways to manage Surrogate. The first is to utilize an exposed helper function, `wrapSurrogate`, to wrap objects and register pre and post methods through it.

```typescript
import { wrapSurrogate, Surrogate, NextHandler } from 'surrogate';

const guitar: Surrogate<Guitar> = wrapSurrogate(new Guitar(), options);

guitar.getSurrogate().registerPreHook('play', ({ next }: NextHandler<Guitar>) => {
  // do things before running 'play'

  next.next();
});
```

Check [examples](./examples) for expanded samples.

### Wrap Surrogate Options

| Option       | Type    | Default Value | Description                                 |
| ------------ | ------- | :-----------: | ------------------------------------------- |
| useSingleton | boolean |     true      | Informs Surrogate to operate as a Singleton |

### Surrogate Methods

After wrapping your instance with Surrogate new methods are available, `getSurrogate`, which, when called will return an instance of Surrogate Event Manager that allows management of pre and post methods and `disposeSurrogate` which will restore all methods, deregister hooks and remove the current instance from Surrogate management.

| Method           | Parameters | Returns               | Description                                            |
| ---------------- | :--------: | --------------------- | ------------------------------------------------------ |
| getSurrogate     |    n/a     | SurrogateEventManager | Provides capabilities for [de]registering hooks.       |
| disposeSurrogate |    n/a     | T                     | Cleans current instance of Surrogate handlers          |
| bypassSurrogate  |    n/a     | T                     | Allows calling target methods without running handlers |

### SurrogateEventManager Methods

| Method              | Parameters                                                                    | Returns               | Description                                  |
| ------------------- | ----------------------------------------------------------------------------- | --------------------- | -------------------------------------------- |
| registerPreHook     | (event: string, handler: SurrogateHandler, options?: SurrogateHandlerOptions) | SurrogateEventManager | Registers a `pre` hook                       |
| registerPostHook    | (event: string, handler: SurrogateHandler, options?: SurrogateHandlerOptions) | SurrogateEventManager | Registers a `post` hook                      |
| deregisterPreHooks  | (event: string)                                                               | SurrogateEventManager | Deregisters `pre` hooks for the given event  |
| deregisterPostHooks | (event: string)                                                               | SurrogateEventManager | Deregisters `post` hooks for the given event |
| deregisterHooks     | n/a                                                                           | SurrogateEventManager | Removes all hooks for the current instance.  |

SurrogateHandler is any function that accepts a `NextHandler` object which can be used to control flow through pre and post hooks.

### NextHandler

`NextHandler` is passed to all hook handlers. It can supply the unwrapped or surrogate wrapped instance to the current handler. An `INext` object provides functionality to skip hooks or continue to the next hook for execution.

| Property     | Type      | Description                                              |
| ------------ | --------- | -------------------------------------------------------- |
| action       | string    | Provides the current action or method target.            |
| hookType     | string    | Provides the current hook type as a string.              |
| originalArgs | any[]     | Array of arguments passed to the original called method. |
| receivedArgs | any[]     | Array of arguments passed from the last handler.         |
| instance     | T         | Provides handler access to the unwrapped instance.       |
| surrogate    | Surrogate | Provides handler access to surrogate wrapped instance.   |
| next         | INext     | Object that provides flow control capabilities           |

| Method   | Member Of | Parameters                            | Default Value | Description                                                                                  |
| -------- | :-------: | ------------------------------------- | ------------- | -------------------------------------------------------------------------------------------- |
| skip     |   next    | (skipAmount?: number)                 | 1             | Method that will skip the next 'skipAmount' handlers                                         |
| skipWith |   next    | (skipAmount?: number, ...args: any[]) | 1             | Same as `skip` but will accept any number of arguments, passing to the next executed handler |
| next     |   next    | (nextOptions?: NextOptions)           | n/a           | Calling next may advance to the next hook.                                                   |

#### Next Options

| Property  | Type    | Description                                                                                       |
| --------- | ------- | ------------------------------------------------------------------------------------------------- |
| error?    | Error   | Passing an Error may result in the error being thrown, depending on supplied handler options      |
| using?    | any[]   | An array of values to pass to the next handler                                                    |
| bail?     | boolean | Indicates all subsequent handler executions should stop immediately. Target method is not called. |
| bailWith? | any     | If bailing, the supplied value should be returned                                                 |

### SurrogateHandlerOptions

When registering a hook you may provide any of the following options.

| Property       | Type                           | Default Value | Description                                                                                                                                                                                                                           |
| -------------- | ------------------------------ | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| useNext?       | boolean                        | true          | `true` indicates usage of the `INext` object to control flow, otherwise Surrogate makes a determination when to advance                                                                                                               |
| ignoreErrors?  | boolean                        | false         | If true and an Error is passed Surrogate will not throw.                                                                                                                                                                              |
| useContext?    | any                            | T             | The context in which to call surrogate handlers.                                                                                                                                                                                      |
| resetContext?  | boolean                        | true          | Upon completion of all hooks in the chain the original method will be restored if true, otherwise the bound handler will remain for the current instance. If set to false you may need to call `disposeSurrogate` for memory cleanup. |
| wrapper?       | MethodWrappers                 | sync          | Tells Surrogate if it is managing synchronous or asynchronous methods.                                                                                                                                                                |
| runConditions? | RunCondition \| RunCondition[] | n/a           | Conditions to determine if a handler should be executed.                                                                                                                                                                              |

#### RunCondition

A RunCondition is a function that returns a boolean indicating if the current handler should be executed(`true`) or skipped(`false`). All run conditions are executed synchronously and all conditions must be true for the handler to execute.

| Parameter  | Type                   | Description                                                                          |
| ---------- | ---------------------- | ------------------------------------------------------------------------------------ |
| instance   | T                      | The current unwrapped instance                                                       |
| parameters | RunConditionParameters | An object containing additional information useful for determining handler execution |

| Property          | Member Of              | Type    | Description                                        |
| ----------------- | ---------------------- | ------- | -------------------------------------------------- |
| action            | RunConditionParameters | string  | The current target method.                         |
| didError          | RunConditionParameters | boolean | Indicates if the previous handler passed an Error. |
| receivedArguments | RunConditionParameters | any[]   | Arguments received from the previous handler.      |

---

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
import { NextHandler, SurrogatePre, SurrogatePost, SurrogateDelegate } from 'surrogate';

@SurrogateDelegate()
class Guitar {
  @SurrogatePre(({ next }: NextHandler<Guitar>) => {
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
