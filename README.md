# Surrogate

Easily create `Pre` and `Post` hooks on JavaScript objects.

## Install

`npm install surrogate`

or

`yarn add surrogate`

## Usage

There are a couple ways to manage Surrogate. The first is to utilize an exposed helper function, `wrapSurrogate`, to wrap objects and register pre and post methods through it.

```typescript
import { wrapSurrogate, Surrogate, NextParameters } from 'surrogate';

const guitar: Surrogate<Guitar> = wrapSurrogate(new Guitar(), options);

guitar.getSurrogate().registerPreHook('play', ({ next }: NextParameters<Guitar>) => {
  // do things before running 'play'

  next.next();
});
```

Check [examples](./examples) for expanded samples.

### SurrogateOptions

| Option           | Type                          | Default Value | Description                                                                                         |
| ---------------- | ----------------------------- | :-----------: | --------------------------------------------------------------------------------------------------- |
| useSingleton?    | boolean                       |     true      | Informs Surrogate to operate as a Singleton                                                         |
| useContext?      | any                           |       T       | The context in which to call surrogate handlers. Handler specific contexts take precedence.         |
| provide?         | any                           |     null      | User provided content to pass to handlers and conditionals. Handler specific values take precedence |
| maintainContext? | boolean \| string \| string[] |     false     | Maintain context for methods without hooks. Can be a method name or array of method names           |

### SurrogateMethods

After wrapping your instance with Surrogate new methods are available, `getSurrogate`, which, when called will return an instance of Surrogate Event Manager that allows management of pre and post methods and `disposeSurrogate` which will restore all methods, deregister hooks and remove the current instance from Surrogate management.

| Method           | Parameters | Returns               | Description                                            |
| ---------------- | :--------: | --------------------- | ------------------------------------------------------ |
| getSurrogate     |    n/a     | SurrogateEventManager | Provides capabilities for managing method hooks        |
| disposeSurrogate |    n/a     | T                     | Cleans current instance of Surrogate handlers          |
| bypassSurrogate  |    n/a     | T                     | Allows calling target methods without running handlers |

### SurrogateEventManager

| Method              | Parameters                                                                     | Returns               | Description                                  |
| ------------------- | ------------------------------------------------------------------------------ | --------------------- | -------------------------------------------- |
| registerPreHook     | (event: string, handler: SurrogateHandlers, options?: SurrogateHandlerOptions) | SurrogateEventManager | Registers a `pre` hook                       |
| registerPostHook    | (event: string, handler: SurrogateHandlers, options?: SurrogateHandlerOptions) | SurrogateEventManager | Registers a `post` hook                      |
| deregisterPreHooks  | (event: string)                                                                | SurrogateEventManager | Deregisters `pre` hooks for the given event  |
| deregisterPostHooks | (event: string)                                                                | SurrogateEventManager | Deregisters `post` hooks for the given event |
| deregisterHooks     | n/a                                                                            | SurrogateEventManager | Removes all hooks for the current instance.  |

SurrogateHandlers is any function that accepts a `NextParameters` object which can be used to control flow through pre and post hooks. It may also be the name of a method on the target object.

### CommonParameters

Common parameters passed to all handlers and conditional functions. (runConditions, runOnError, runOnBail)

| Property          | Member Of          | Type        | Description                                                                            |
| ----------------- | ------------------ | ----------- | -------------------------------------------------------------------------------------- |
| action            | ProviderParameters | string      | The current target method.                                                             |
| correlationId     | ProviderParameters | string      | Unique identifier for the current hook pipeline                                        |
| instance          | ProviderParameters | T           | The current unwrapped instance                                                         |
| error?            | ProviderParameters | Error       | An error object, if passed                                                             |
| hookType          | ProviderParameters | string      | Provides the current hook type as a string.                                            |
| receivedArguments | ProviderParameters | any[]       | Arguments received from the previous handler.                                          |
| currentArgs       | ProviderParameters | any[]       | Array of potentially modified arguments passed to original method invoked by surrogate |
| originalArgs      | ProviderParameters | any[]       | Array of arguments passed to the instance invoked method                               |
| timeTracker       | ProviderParameters | TimeTracker | Provides access to the current time tracker                                            |
| result            | ProviderParameters | any         | Result of original method invocation if run                                            |
| provide           | ProviderParameters | any         | User provided content to pass to handlers and conditionals. Default value is `null`    |

### NextParameters

`NextParameters` is passed to all hook handlers. In addition to `CommonParameters` you'll receive the current Surrogate wrapped instance and an `INext` object that provides functionality to skip hooks or continue to the next hook for execution.

| Property  | Type      | Description                                            |
| --------- | --------- | ------------------------------------------------------ |
| surrogate | Surrogate | Provides handler access to surrogate wrapped instance. |
| next      | INext     | Object that provides flow control capabilities         |

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
| replace?  | any     | Replaces the original arguments passed to the target method.                                                            |
| bailWith? | any     | If bailing, the supplied value should be returned                                                                       |

### SurrogateHandlerOptions

When registering a hook you may provide any of the following options.

| Property       | Type                           | Default Value | Description                                                                                                             |
| -------------- | ------------------------------ | :-----------: | ----------------------------------------------------------------------------------------------------------------------- |
| useNext?       | boolean                        |     true      | `true` indicates usage of the `INext` object to control flow, otherwise Surrogate makes a determination when to advance |
| noArgs?        | boolean                        |     false     | Specify that `NextParameters` should NOT be passed to a handler                                                         |
| ignoreErrors?  | boolean                        |     false     | If true and an Error is passed or caught Surrogate will not throw.                                                      |
| useContext?    | any                            |       T       | The context in which to call surrogate handlers.                                                                        |
| wrapper?       | MethodWrappers                 |     sync      | Tells Surrogate if it is managing synchronous or asynchronous methods.                                                  |
| runConditions? | RunCondition \| RunCondition[] |      n/a      | Conditions to determine if a handler should be executed.                                                                |
| runOnError?    | RunOnError \| RunOnError[]     |      n/a      | Functions to run in the event of handler error. Runs regardless of ignoreError                                          |
| runOnBail?     | RunOnBail \| RunOnBail[]       |      n/a      | Functions to run in the event of handler bailing.                                                                       |
| priority?      | number                         |       0       | Used to determine the order in which handlers are executed. Larger numbers have higher priority                         |

`useContext` option defaults to the current instance. Specifying context should be `surrogate` will allow hooks in the pipeline to trigger additional hooks. This can be extraordinarily useful but has the potential to cause recursive loops.

#### RunCondition

A RunCondition is a function that receives `RunConditionParameters`, which includes [CommonParameters](#-CommonParameters) and returns a boolean indicating if the current handler should be executed(`true`) or skipped(`false`). All run conditions are executed synchronously and all conditions must be true for the handler to execute.

| Property                    | Member Of              | Type    | Description                                         |
| --------------------------- | ---------------------- | ------- | --------------------------------------------------- |
| didError                    | RunConditionParameters | boolean | Indicates if the previous handler passed an Error.  |
| valueFromCondition          | RunConditionParameters | any     | Value passed forward from previous run condition    |
| didReceiveFromLastCondition | RunConditionParameters | boolean | Indicates if the previous condition passed a value. |
| passToNextCondition()       | RunConditionParameters | any     | Function to pass a value to next condition          |

#### RunOnError

`RunOnError` is a function that receives `RunOnErrorParameters`, which includes [CommonParameters](#-CommonParameters) and the ability to recover from an error.

| Property           | Member Of            | Type    | Description                                       |
| ------------------ | -------------------- | ------- | ------------------------------------------------- |
| error              | RunOnErrorParameters | Error   | An error object received or caught from a handler |
| recoverFromError() | RunOnErrorParameters | boolean | Function to recover from an error                 |

#### RunOnBail

`RunOnBail` is a function that receives `RunOnBailParameters`, which includes [CommonParameters](#-CommonParameters) and the ability to recover from a bailing handler.

| Property          | Member Of           | Type    | Description                                |
| ----------------- | ------------------- | ------- | ------------------------------------------ |
| bailWith()        | RunOnBailParameters | any     | Function that accepts a value to bail with |
| recoverFromBail() | RunOnBailParameters | boolean | Function to recover from a bailing handler |

---

## Decorators

Perhaps a more convenient way to register hooks is with decorators.

```typescript
import { SurrogateDelegate } from 'surrogate';

@SurrogateDelegate()
class Guitar {}
```

`SurrogateDelegate` registers your class and will automatically wrap instances of that class with Surrogate.  
It supports all options from [`SurrogateOptions`](#-SurrogateOptions) as well as option `locateWith` which may be provided to assist Surrogate in
locating method decorators for a particular class. Should only be necessary if multiple class decorators are utilized.

```typescript
import { SurrogateDelegate } from 'surrogate';

@SurrogateDelegate({
  locateWith: Guitar,
})
@MyOtherClassDecorator()
class Guitar {}
```

If you wish to use `Surrogate` [methods](#-SurrogateMethods) inside this instance of your class you must extend `SurrogateMethods` interface.

```typescript
import { SurrogateDelegate, SurrogateMethods } from 'surrogate';

export interface Guitar extends SurrogateMethods<Guitar> {}

@SurrogateDelegate()
export class Guitar {}
```

Registering hooks:

```typescript
import { NextParameters, SurrogatePre, SurrogatePost, SurrogateDelegate } from 'surrogate';

@SurrogateDelegate()
class Guitar {
  @SurrogatePre(({ next }: NextParameters<Guitar>) => {
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

|  Option  | Type                                                 | Default Value | Description                                                                       |
| :------: | ---------------------------------------------------- | :-----------: | --------------------------------------------------------------------------------- |
| handler  | [SurrogateHandlers](##-SurrogateEventManager)        |      n/a      | This function or array of functions will run before or after the decorated method |
| options? | [SurrogateHandlerOptions](#-SurrogateHandlerOptions) |      {}       | Options defining `Surrogate` handler behavior                                     |

### NextDecoratorOptions

All `Next[Async](Pre|Post)` decorators accept `NextDecoratorOptions` or an array of options. Any method decorated with Next\* will be registered as a Surrogate handler. Therefore, you must supply the target method the Next\* method will run with.

|  Option  | Type                                                 | Default Value | Description                                                             |
| :------: | ---------------------------------------------------- | :-----------: | ----------------------------------------------------------------------- |
|  action  | keyof T \| string \| (keyof T \| string )[]          |      n/a      | Name of the target decorated method, accepts regexp string for matching |
| options? | [SurrogateHandlerOptions](#-SurrogateHandlerOptions) |      {}       | Options defining `Surrogate` handler behavior                           |

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
  }: NextParameters<Account>) {
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
