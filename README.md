# Surrogate

Easily create `Pre` and `Post` hooks on JavaScript objects.

## Install

Currently unpublished..

## Usage

```typescript
import { surrogateWrap, Surrogate } from 'some-future-published-package';

const instance: Surrogate<MyClass> = surrogateWrap(new MyClass(), options);

instance.registerPreHook('instanceMethod', () => {
  // do stuff before or after your instance method,
  // or determine if the chosen method should run at all
  // return false to stop calling handlers(pre or post)
});
```

## Methods

registerPreHook(method: string, handler: Function): Surrogate\<T\>  
registerPostHook(method: string, handler: Function): Surrogate\<T\>

Work in progress...  
deregisterPreHook(method: string, handler: Function): Surrogate\<T\>  
deregisterPostHook(method: string, handler: Function): Surrogate\<T\>  
deregisterHooksFor(event: string): Surrogate\<T\>

## Options

useSingleton: boolean # informs Surrogate to operate as a Singleton -- default: `true`  
suppressWarnings: boolean # suppress certain messages Surrogate may produce -- default: `false`

### Information

Surrogate holds onto your class instance in a Weakmap, so once you're done with it no cleanup needed.
