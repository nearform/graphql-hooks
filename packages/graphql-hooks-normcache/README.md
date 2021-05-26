# graphql-hooks-normcache

In-memory normalized cache implementation for graphql-hooks

## Install

`npm install graphql-hooks-normcache`

or

`yarn add graphql-hooks-normcache`

## Quick Start

This is intended to be used as the `cache` option when calling `createClient` from `graphql-hooks`.

```js
import { GraphQLClient } from 'graphql-hooks'
import normCache from 'graphql-hooks-normcache'

const client = new GraphQLClient({
  url: '/graphql',
  cache: normCache()
})
```

### Options

`normCache(options)`: Option object properties

- `size`: The number of items to store in the cache
- `ttl`: Milliseconds an item will remain in cache. The default behaviour will only evict items when the `size` limit has been reached
- `initialState`: The value from `cache.getInitialState()` used for rehydrating the cache after SSR

### API

- `cache.get(key)`: Find the item in the cache that matches `key`
- `cache.set(key, value)`: Set an item in the cache
- `cache.delete(key)`: Does nothing
- `cache.clear()`: Clear all items from the cache
- `cache.keys()`: Returns an array of keys, useful when you need to iterate over the cache items
- `cache.getInitialState()`: A serialisable version of the cache - used during SSR
