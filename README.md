# graphql-hooks

[![CircleCI](https://circleci.com/gh/nearform/graphql-hooks/tree/master.svg?style=svg)](https://circleci.com/gh/nearform/graphql-hooks/tree/master)
[![Coverage Status](https://coveralls.io/repos/github/nearform/graphql-hooks/badge.svg?branch=master)](https://coveralls.io/github/nearform/graphql-hooks?branch=master)

🎣 Minimal hooks-first graphql client.

## Features

- 🥇 First-class hooks API
- 🔥 No more render props hell
- ⚖️ Lightweight; only what you really need
- ️️♻️ Promise-based API (works with `async` / `await`)
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

## TOC

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
