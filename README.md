# graphql-hooks

[![CircleCI](https://circleci.com/gh/nearform/graphql-hooks/tree/master.svg?style=svg)](https://circleci.com/gh/nearform/graphql-hooks/tree/master)
[![Coverage Status](https://coveralls.io/repos/github/nearform/graphql-hooks/badge.svg?branch=master)](https://coveralls.io/github/nearform/graphql-hooks?branch=master)
![](https://img.shields.io/bundlephobia/minzip/graphql-hooks.svg?style=flat)

🎣 Minimal hooks-first graphql client.

## Features

- 🥇 First-class hooks API
- ⚖️ _Tiny bundle_: only 3.7kB (1.4 gzipped)
- 📄 SSR Support: see [graphql-hooks-ssr](https://github.com/nearform/graphql-hooks-ssr)
- 🔌 Plugin Caching Options: see [graphql-hooks-memcache](https://github.com/nearform/graphql-hooks-memcache)
- 🔥 No more render props hell
- ⏳ Handle loading and error states with ease

## Install

`npm install graphql-hooks`

or

`yarn add graphql-hooks`

## Quick Start

First you'll need to create a client and wrap your app with the provider:

```js
import { GraphQLClient, ClientContext } from 'graphql-hooks';

const client = new GraphQLClient({
  url: '/graphql'
});

function App() {
  return (
    <ClientContext.Provider value={client}>
      {/* children */}
    </ClientContext.Provider>
  );
}
```

Now in your child components you can make use of `useQuery`

```js
import { useQuery } from 'graphql-hooks';

const HOMEPAGE_QUERY = `query HomePage($limit: Int) {
  users(limit: $limit) {
    id
    name
  }
}`;

function MyComponent() {
  const { loading, error, data } = useQuery(HOMEPAGE_QUERY, {
    variables: {
      limit: 10
    }
  });

  if (loading) return 'Loading...';
  if (error) return 'Something Bad Happened';

  return (
    <ul>
      {data.users.map(({ id, name }) => (
        <li key={id}>{name}</li>
      ))}
    </ul>
  );
}
```

# Table of Contents

- APIs
  - [GraphQLClient](#GraphQLClient)
  - [ClientContext](#ClientContext)
  - [useClient](#useClient)
  - [useQuery](#useQuery)
  - [useManualQuery](#useManualQuery)
  - [useMutation](#useMutation)
- Guides
  - [SSR](#SSR)
  - [Authentication](#Authentication)
  - [Refetching a query](#Refetching-a-query)
  - [Fragments](#Fragments)

## API

### `GraphQLClient`

```js
import { GraphQLClient } from 'graphql-hooks';
const client = new GraphQLClient(config);
```

**`config`**: Object with containing configuration properites

- `url` (**Required**): The url to your graphql server
- `ssrMode`: Boolean - set to `true` when using on the server for server-side rendering; defaults to `false`
- `cache`: Object with the following methods:
  - `cache.get(key)`
  - `cache.set(key, data)`
  - `cache.delete(key)`
  - `cache.clear()`
  - `cache.keys()`
  - `getInitialState()`
  - See [graphql-hooks-memcache](https://github.com/nearform/graphql-hooks-memcache) as a refernce implementation
- `fetch(url, options)`: Fetch implementation - defaults to the global `fetch` API
- `fetchOptions`: See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch) for info on what options can be passed
- `headers`: Object, e.g. `{ 'My-Header': 'hello' }`
- `logErrors`: Boolean - defaults to `true`
- `onError({ operation, result })`: Custom error handler
  - `operation`: Object with `query`, `variables` and `operationName`
  - `result`: [Result Object](TODO)

#### `client` methods

- `client.setHeader(key, value)`: Updates `client.headers` adding the new header to the existing headers
- `client.setHeaders(headers)`: Resets `client.headers`
- `client.logErrorResult({ operation, result })`: Default error logger; useful if you'd like to use it inside your custom `onError` handler
- `request(operation, options)`: Make a request to your graphql server; returning a Promise
  - `operation`: Object with `query`, `variables` and `operationName`
- `options.fetchOptionsOverrides`: Object containing additional fetch options to be added to the default ones passed to `new GraphLClient(config)`

### `ClientContext`

### `useClient`

### `useQuery`

### `useManualQuery`

### `useMutation`

## Guides

### SSR

### Authentication

### Refetching a query

### Fragments
