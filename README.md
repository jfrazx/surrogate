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

### SurrogateOptions

| Option        | Type    | Default Value | Description                                                                                 |
| ------------- | ------- | :-----------: | ------------------------------------------------------------------------------------------- |
| useSingleton? | boolean |     true      | Informs Surrogate to operate as a Singleton                                                 |
| useContext?   | any     |       T       | The context in which to call surrogate handlers. Handler specific contexts take precedence. |

### SurrogateMethods

After wrapping your instance with Surrogate new methods are available, `getSurrogate`, which, when called will return an instance of Surrogate Event Manager that allows management of pre and post methods and `disposeSurrogate` which will restore all methods, deregister hooks and remove the current instance from Surrogate management.

| Method           | Parameters | Returns               | Description                                            |
| ---------------- | :--------: | --------------------- | ------------------------------------------------------ |
| getSurrogate     |    n/a     | SurrogateEventManager | Provides capabilities for [de]registering hooks.       |
| disposeSurrogate |    n/a     | T                     | Cleans current instance of Surrogate handlers          |
| bypassSurrogate  |    n/a     | T                     | Allows calling target methods without running handlers |

### SurrogateEventManager

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

| Property     | Type        | Description                                              |
| ------------ | ----------- | -------------------------------------------------------- |
| action       | string      | Provides the current action or method target.            |
| hookType     | string      | Provides the current hook type as a string.              |
| originalArgs | any[]       | Array of arguments passed to the original called method. |
| receivedArgs | any[]       | Array of arguments passed from the last handler.         |
| instance     | T           | Provides handler access to the unwrapped instance.       |
| surrogate    | Surrogate   | Provides handler access to surrogate wrapped instance.   |
| next         | INext       | Object that provides flow control capabilities           |
| timeTracker  | TimeTracker | Provides access to the current time tracker              |

#### TimeTracker

| Method              |  Member Of  | Parameters | Return Value | Description                                         |
| ------------------- | :---------: | :--------: | :----------: | --------------------------------------------------- |
| geStartTime         | TimeTracker |    none    |    number    | Returns the start time of the current pipeline.     |
| getTotalDuration    | TimeTracker |    none    |    number    | Returns the total duration of the current pipeline. |
| getHookStartTime    | TimeTracker |    none    |    number    | Returns the start time of the current hook.         |
| getLastRunDuration  | TimeTracker |    none    |    number    | Returns the duration of the last hook.              |
| getTimeSinceLastRun | TimeTracker |    none    |    number    | Returns the duration since the last hook completed. |

#### INext

| Method   | Member Of | Parameters                           | Default Value | Description                                                                                  |
| -------- | :-------: | ------------------------------------ | :-----------: | -------------------------------------------------------------------------------------------- |
| skip     |   INext   | (skipAmount?: number)                |       1       | Method that will skip the next 'skipAmount' handlers                                         |
| skipWith |   INext   | (skipAmount: number, ...args: any[]) |      []       | Same as `skip` but will accept any number of arguments, passing to the next executed handler |
| next     |   INext   | (nextOptions?: NextOptions)          |      n/a      | Calling next may advance to the next hook.                                                   |

#### Next Options

| Property  | Type    | Description                                                                                                             |
| --------- | ------- | ----------------------------------------------------------------------------------------------------------------------- |
| error?    | Error   | Passing an Error may result in the error being thrown, depending on supplied handler options                            |
| using?    | any[]   | An array of values to pass to the next handler                                                                          |
| bail?     | boolean | Indicates all subsequent handler executions should stop immediately. Target method is not called if bailing in pre hook |
| bailWith? | any     | If bailing, the supplied value should be returned                                                                       |

### SurrogateHandlerOptions

When registering a hook you may provide any of the following options.

| Property       | Type                           | Default Value | Description                                                                                                             |
| -------------- | ------------------------------ | ------------- | ----------------------------------------------------------------------------------------------------------------------- |
| useNext?       | boolean                        | true          | `true` indicates usage of the `INext` object to control flow, otherwise Surrogate makes a determination when to advance |
| noArgs?        | boolean                        | false         | Specify that `NextHandler` should NOT be passed to a handler                                                            |
| ignoreErrors?  | boolean                        | false         | If true and an Error is passed Surrogate will not throw.                                                                |
| useContext?    | any                            | T             | The context in which to call surrogate handlers.                                                                        |
| wrapper?       | MethodWrappers                 | sync          | Tells Surrogate if it is managing synchronous or asynchronous methods.                                                  |
| runConditions? | RunCondition \| RunCondition[] | n/a           | Conditions to determine if a handler should be executed.                                                                |

#### RunCondition

A RunCondition is a function that receives `RunConditionParameters` and returns a boolean indicating if the current handler should be executed(`true`) or skipped(`false`). All run conditions are executed synchronously and all conditions must be true for the handler to execute.

| Property          | Member Of              | Type    | Description                                        |
| ----------------- | ---------------------- | ------- | -------------------------------------------------- |
| action            | RunConditionParameters | string  | The current target method.                         |
| instance          | RunConditionParameters | T       | The current unwrapped instance                     |
| didError          | RunConditionParameters | boolean | Indicates if the previous handler passed an Error. |
| error?            | RunConditionParameters | Error   | An error object, if passed                         |
| receivedArguments | RunConditionParameters | any[]   | Arguments received from the previous handler.      |

---

## Decorators

Perhaps a more convenient way to register hooks is with decorators.

```typescript
import { SurrogateDelegate } from 'surrogate';

@SurrogateDelegate()
class Guitar {}
```

`SurrogateDelegate` registers your class and will automatically wrap instances of that class with Surrogate.  
It supports all options from [`SurrogateOptions`](###SurrogateOptions) as well as option `locateWith` which may be provided to assist Surrogate in
locating method decorators for a particular class. Should only be necessary if multiple class decorators are utilized.

```typescript
import { SurrogateDelegate } from 'surrogate';

@SurrogateDelegate({
  locateWith: Guitar,
})
@MyOtherClassDecorator()
class Guitar {}
```

If you wish to use `Surrogate` [methods](###SurrogateMethods) on your class instance you must extend `SurrogateMethods` interface.

```typescript
import { SurrogateDelegate, SurrogateMethods } from 'surrogate';

export interface Guitar extends SurrogateMethods<Guitar> {}

@SurrogateDelegate()
export class Guitar {}
```

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

### SurrogateDecoratorOptions

All `Surrogate[Async](Pre|Post)` decorators accept `SurrogateDecoratorOptions` or an array of options and must decorate the intended hooked method.

|  Option  | Type                                                  | Default Value | Description                                                                       |
| :------: | ----------------------------------------------------- | :-----------: | --------------------------------------------------------------------------------- |
| handler  | [SurrogateHandler](##SurrogateEventManager)           |      n/a      | This function or array of functions will run before or after the decorated method |
| options? | [SurrogateHandlerOptions](###SurrogateHandlerOptions) |      {}       | Options defining `Surrogate` handler behavior                                     |

### NextDecoratorOptions

All `Next[Async](Pre|Post)` decorators accept `NextDecoratorOptions` or an array of options. Any method decorated with Next\* will be registered as a Surrogate handler. Therefore, you must supply the target method the Next\* method will run with.

|  Option  | Type                                                  | Default Value | Description                                   |
| :------: | ----------------------------------------------------- | :-----------: | --------------------------------------------- |
|  action  | keyof T \| string \| (keyof T \| string )[]           |      n/a      | Name of the target decorated method           |
| options? | [SurrogateHandlerOptions](###SurrogateHandlerOptions) |      {}       | Options defining `Surrogate` handler behavior |

```typescript
@SurrogateDelegate({
  locateWith: Account,
})
@Table({
  timestamps: true,
})
class Account extends Model<Account> {
  @NextAsyncPreAndPost<Account>({
    action: ['update', 'save'],
    options: {
      useNext: false,
    },
  })
  protected async logActions({
    instance: model,
    originalArgs,
    timeTracker,
    hookType,
    action,
  }: NextHandler<Account>) {
    const keys = (model.changed() || []) as (keyof Account)[];
    const changes = keys.reduce(
      (changed, key) => ({
        ...changed,
        [key]: {
          current: model.getDataValue(key),
          previous: model.previous(key),
        },
      }),
      {},
    );

    telemetry.trackEvent({
      name: `${hookType}|${action}|Logging`,
      properties: {
        action,
        changes,
        hookType,
        model: model.toJSON(),
        arguments: originalArgs,
      },
      measurements: {
        lastRunDuration: timeTracker.getDurationSinceLastRun(),
      },
    });
  }
}
```

## Acknowledgements

Many thanks to [Dale](https://github.com/divmain) for transferring the npm package name.
