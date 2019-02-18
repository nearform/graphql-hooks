# graphql-hooks

[![CircleCI](https://circleci.com/gh/nearform/graphql-hooks/tree/master.svg?style=svg)](https://circleci.com/gh/nearform/graphql-hooks/tree/master)
[![Coverage Status](https://coveralls.io/repos/github/nearform/graphql-hooks/badge.svg?branch=master)](https://coveralls.io/github/nearform/graphql-hooks?branch=master)
![](https://img.shields.io/bundlephobia/minzip/graphql-hooks.svg?style=flat)

🎣 Minimal hooks-first GraphQL client.

## Features

- 🥇 First-class hooks API
- ⚖️ _Tiny_ bundle: only 3.7kB (1.4 gzipped)
- 📄 Full SSR support: see [graphql-hooks-ssr](https://github.com/nearform/graphql-hooks-ssr)
- 🔌 Plugin Caching: see [graphql-hooks-memcache](https://github.com/nearform/graphql-hooks-memcache)
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

- API
  - [GraphQLClient](#GraphQLClient)
  - [ClientContext](#ClientContext)
  - [useQuery](#useQuery)
  - [useManualQuery](#useManualQuery)
  - [useMutation](#useMutation)
- Guides
  - [SSR](#SSR)
  - [Authentication](#Authentication)
  - [Fragments](#Fragments)
  - [Migrating from Apollo](#Migrating-from-Apollo)

## API

## `GraphQLClient`

**Usage**:

```js
import { GraphQLClient } from 'graphql-hooks';
const client = new GraphQLClient(config);
```

**`config`**: Object with containing configuration properites

- `url` (**Required**): The url to your GraphQL server
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

### `client` methods

- `client.setHeader(key, value)`: Updates `client.headers` adding the new header to the existing headers
- `client.setHeaders(headers)`: Resets `client.headers`
- `client.logErrorResult({ operation, result })`: Default error logger; useful if you'd like to use it inside your custom `onError` handler
- `request(operation, options)`: Make a request to your GraphQL server; returning a Promise
  - `operation`: Object with `query`, `variables` and `operationName`
- `options.fetchOptionsOverrides`: Object containing additional fetch options to be added to the default ones passed to `new GraphLClient(config)`

## `ClientContext`

`ClientContext` is the result of `React.createContext()` - meaning it can be used directly with React's new context API:

**Example**:

```js
import { ClientContext } from 'graphql-hooks';
<ClientContext.Provider value={client}>
  {/* children can now consume the client context */}
</ClientContext.Provider>;
```

To access the `GraphQLClient` instance, call `React.useContext(ClientContext)`:

```js
import React, { useContext } from 'react';
import { ClientContext } from 'graphql-hooks';

function MyComponent() {
  const client = useContext(ClientContext);
}
```

## `useQuery`

**Usage**:

```js
const state = useQuery(query, options);
```

**Example:**

```js
import { useQuery } from 'graphql-hooks';

function MyComponent() {
  const { loading, error, data } = useQuery(query);

  if (loading) return 'Loading...';
  if (error) return 'Something bad happened';

  return <div>{data.thing}</div>;
}
```

This is a custom hook that takes care of fetching your query and storing the result in the cache. It won't refetch the query unless `query` or `options.variables` changes.

- `query`: Your GraphQL query as a plain string
- `options`: Object with the following optional properties
  - `variables`: Object e.g. `{ limit: 10 }`
  - `operationName`: If your query has multiple operations, pass the name of the operation you wish to execute.
  - `useCache`: Boolean - defaults to `true`; cache the query result
  - `skipCache`: Boolean - defaults to `false`; If `true` it will by-pass the cache and fetch, but the result will then be cached for subsequent calls. Note the `refetch` function will do this automatically
  - `ssr`: Boolean - defaults to `true`. Set to `false` if you wish to skip this query during SSR
  - `fetchOptionsOverrides`: Object - Specific overrides for this query. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch) for info on what options can be passed

### `useQuery` return value

```js
const { loading, error, data, refetch, cacheHit, ...errors } = useQuery(QUERY);
```

- `loading`: Boolean - `true` if the query is in flight
- `error`: Boolean - `true` if `fetchError` or `httpError` or `graphQLErrors` has been set
- `data`: Object - the result of your GraphQL query
- `refetch`: Function - useful when refetching the same query after a mutation; NOTE this presets `skipCache=true`
- `cacheHit`: Boolean - `true` if the query result came from the cache, useful for debugging
- `fetchError`: Object - Set if an error occured during the `fetch` call
- `httpError`: Object - Set if an error response was returned from the server
- `graphQLErrors`: Array - Populated if any errors occured whilst resolving the query

## `useManualQuery`

Use this when you don't want a query to automactially be fetched, or wish to call a query programmatically.

**Usage**:

```js
const [queryFn, state] = useManualQuery(query, [options]);
```

**Example**:

```js
import { useManualQuery } from 'graphql-hooks'

function MyComponent(props) {
  const [fetchUser, { loading, error, data }] = useManualQuery(GET_USER_QUERY, {
    variables: { id: props.userId }
  })

  return (
    <div>
      <button onClick={fetchUser}>Get User!</button>
      {error && <div>Failed to fetch user<div>}
      {loading && <div>Loading...</div>}
      {data && <div>Hello ${data.user.name}</div>}
    </div>
  )
}
```

If you don't know certain options when declaring the `useManualQuery` you can also pass the same options to the query function itself when calling it:

```js
import { useManualQuery } from 'graphql-hooks';

function MyComponent(props) {
  const [fetchUser] = useManualQuery(GET_USER_QUERY);

  const fetchUserThenSomething = async () => {
    const user = await fetchUser({
      variables: { id: props.userId }
    });
    return somethingElse();
  };

  return (
    <div>
      <button onClick={fetchUserThenSomething}>Get User!</button>
    </div>
  );
}
```

## `useMutation`

Mutations unlike Queries are not cached.

**Usage**:

```js
const [mutationFn, state] = useMutation(mutation, [options]);
```

**Example**:

```js
import { useMutation } from 'graphql-hooks';

const UPDATE_USER_MUTATION = `mutation UpdateUser(id: String!, name: String!) {
  updateUser(id: $id, name: $name) {
    name
  }
}`;

function MyComponent({ id, name }) {
  const [updateUser] = useMutation(UPDATE_USER_MUTATION);
  const [newName, setNewName] = useState(name);

  return (
    <div>
      <input
        type="text"
        value={newName}
        onChange={e => setNewName(e.target.value)}
      />
      <button
        onClick={() => updateUser({ variables: { id, name: newName } })}
      />
    </div>
  );
}
```

The `options` object that can be passed either to `useMutation(mutation, options)` or `mutationFn(otpions)` can be set with the following properties:

- `variables`: Object e.g. `{ limit: 10 }`
- `operationName`: If your query has multiple operations, pass the name of the operation you wish to execute.
- `fetchOptionsOverrides`: Object - Specific overrides for this query. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch) for info on what options can be passed

## Guides

### SSR

See [graphql-hooks-ssr](https://github.com/nearform/graphql-hooks-ssr) for an in depth guide.

### Authentication

Coming soon!

### Fragments

Coming soon!

### Migrating from Apollo

Coming soon!
