# graphql-hooks-memcache

In-memory caching implementation for graphql-hooks

## Install

`npm install graphql-hooks-memcache`

or

`yarn add graphql-hooks-memcache`

## Quick Start

This is intended to be used as the `cache` option when calling `createClient` from `graphql-hooks`.

```js
import { createClient } from 'graphql-hooks';
import memCache from 'graphql-hooks-memcache';

const client = createClient({
  endpoint: '/graphql',
  cache: memCache()
});
```

### Options

`memCache(options)`: Option object properties

- `size`: The number of items to store in the cache
- `ttl`: Milliseconds an item will remain in cache. Default behaviour will only evict items when `size` limit has been reached
- `initialState`: The value from `cache.getInitialState()` used for rehydrating the cache after SSR

### API

- `cache.get(key)`: Find item in cache that matches `key`
- `cache.set(key, value)`: Set an item in the cache
- `cache.delete(key)`: Delete an item from the cache
- `cache.clear()`: Clear all items from the cache
- `cache.keys()`: Returns an array of keys, useful when you need to iterate over the cache items
- `cache.getInitialState()`: A serialisable version of the cache - used during SSR