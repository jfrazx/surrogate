# Surrogate

Simple pre and post hosts using ES6 Proxy

## Install

Currently unpublished..

## Usage (eventually...)

```typescript
import { wrapper, Surrogate } from 'some-future-published-package';

const instance: Surrogate<MyClass> = wrapper(new MyClass(), options);

instance.registerPreHook('instanceMethod', () => {
  // do stuff before or after your instance method,
  // or determine if the chosen method should run at all
  // return false to stop calling handlers(pre or post)
});
```

## Methods

registerPreHook(method: string, handler: Function): Surrogate\<T\>  
registerPostHook(method: string, handler: Function): Surrogate\<T\>

Work in progres...  
deregisterPreHook(method: string, handler: Function): Surrogate\<T\>  
deregisterPostHook(method: string, handler: Function): Surrogate\<T\>  
deregisterHooksFor(event: string): Surrogate\<T\>

## Options

useSingleton: boolean # informs Surrogate to operate as a Singleton -- default: `true`

### Information

Surrogate holds onto your class instance in a Weakmap, so once you're done with it no cleanup needed.
