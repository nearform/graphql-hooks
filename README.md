# graphql-hooks

[![ci](https://github.com/nearform/graphql-hooks/workflows/ci/badge.svg)](https://github.com/nearform/graphql-hooks/actions?query=workflow%3Aci)
[![Coverage Status](https://coveralls.io/repos/github/nearform/graphql-hooks/badge.svg?branch=master)](https://coveralls.io/github/nearform/graphql-hooks?branch=master)
[![bundlephobia](https://img.shields.io/bundlephobia/minzip/graphql-hooks.svg?style=flat&label=size)](https://bundlephobia.com/result?p=graphql-hooks)
[![npm](https://img.shields.io/npm/v/graphql-hooks.svg?color=brightgreen)](https://www.npmjs.com/package/graphql-hooks)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)

🎣 Minimal hooks-first GraphQL client.

## Features

- 🥇 First-class hooks API
- ⚖️ _Tiny_ bundle: only 7.6kB (2.8 gzipped)
- 📄 Full SSR support: see [graphql-hooks-ssr](packages/graphql-hooks-ssr)
- 🔌 Plugin Caching: see [graphql-hooks-memcache](packages/graphql-hooks-memcache)
- 🔥 No more render props hell
- ⏳ Handle loading and error states with ease

## Install

`npm install graphql-hooks`

or

`yarn add graphql-hooks`

## Support

- Node LTS
- Browsers [`> 1%, not dead`](https://browserl.ist/?q=%3E+1%25%2C+not+dead)

Consider polyfilling:

- [`FormData`](https://developer.mozilla.org/docs/Web/API/FormData)
- [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)
- [`fetch`](https://developer.mozilla.org/docs/Web/API/Fetch_API). NOTE: A custom implementation can also be provided instead of polyfilling, [see `GraphQLClient`](#GraphQLClient)

## Quick Start

First you'll need to create a client and wrap your app with the provider:

```js
import { GraphQLClient, ClientContext } from 'graphql-hooks'

const client = new GraphQLClient({
  url: '/graphql'
})

function App() {
  return (
    <ClientContext.Provider value={client}>
      {/* children */}
    </ClientContext.Provider>
  )
}
```

Now in your child components you can make use of `useQuery`

```js
import { useQuery } from 'graphql-hooks'

const HOMEPAGE_QUERY = `query HomePage($limit: Int) {
  users(limit: $limit) {
    id
    name
  }
}`

function MyComponent() {
  const { loading, error, data } = useQuery(HOMEPAGE_QUERY, {
    variables: {
      limit: 10
    }
  })

  if (loading) return 'Loading...'
  if (error) return 'Something Bad Happened'

  return (
    <ul>
      {data.users.map(({ id, name }) => (
        <li key={id}>{name}</li>
      ))}
    </ul>
  )
}
```

## Why `graphql-hooks`?

The first thing you may ask when seeing `graphql-hooks` is "Why not use Apollo hooks?".
It's the comparison most will make. In fact, there's an [article comparing the two](https://blog.logrocket.com/comparing-hooks-libraries-for-graphql/) over on LogRocket.

We believe `graphql-hooks` is a great choice as a hooks-first GraphQL client due to its concise API and package size.

In terms of performance, this is more of a grey area as we have no official benchmarks yet.

If you need a client that offers more customization such as advanced cache configuration, then `apollo-hooks` may work out to be a good choice for your project if bundle size is not an issue.

| Pros                        | Cons                                  |
| --------------------------- | ------------------------------------- |
| Small in size               | Less "advanced" caching configuration |
| Concise API                 |
| Quick to get up and running |

# Table of Contents

- API
  - [GraphQLClient](#GraphQLClient)
  - [ClientContext](#ClientContext)
  - [useQuery](#useQuery)
  - [useManualQuery](#useManualQuery)
  - [useMutation](#useMutation)
  - [useSubscription](#useSubscription)
- Guides
  - [SSR](#SSR)
  - [Pagination](#Pagination)
  - [File uploads](#File-uploads)
  - [HTTP Get Support](#HTTP-Get-support)
  - [Authentication](#Authentication)
  - [Fragments](#Fragments)
  - [Migrating from Apollo](#Migrating-from-Apollo)
    - [ApolloClient ➡️ GraphQLClient](#apolloclient-️-graphqlclient)
    - [ApolloProvider ➡️ ClientContext.Provider](#apolloprovider-️-clientcontextprovider)
    - [Query Component ➡️ useQuery](#query-component-️-usequery)
    - [Mutation Component ➡️ useMutation](#mutation-component-️-usemutation)
  - [Other]
    - [Request interceptors](#request-interceptors)

## API

## `GraphQLClient`

**Usage**:

```js
import { GraphQLClient } from 'graphql-hooks'
const client = new GraphQLClient(config)
```

**`config`**: Object containing configuration properties

- `url`: The URL of your GraphQL **HTTP** server. If not specified, you must enable `fullWsTransport` and provide a valid `subscriptionClient`; otherwise is **required**.
- `fullWsTransport`: Boolean - set to `true` if you want to use `subscriptionClient` to also send query and mutations via WebSocket; defaults to `false`
- `ssrMode`: Boolean - set to `true` when using on the server for server-side rendering; defaults to `false`
- `useGETForQueries`: Boolean - set to `true` to use HTTP GET method for all queries; defaults to false. See [HTTP Get Support](#HTTP-Get-support) for more info
- `subscriptionClient`: The **WebSocket** client configuration. Accepts either an instance of `SubscriptionClient` from [subscriptions-transport-ws](https://github.com/apollographql/subscriptions-transport-ws) or `Client` from [graphql-ws](https://github.com/enisdenjo/graphql-ws). A factory function is also accepted e.g. to avoid the creation of the client in SSR environments.
- `cache` (**Required** if `ssrMode` is `true`, otherwise optional): Object with the following methods:
  - `cache.get(key)`
  - `cache.set(key, data)`
  - `cache.delete(key)`
  - `cache.clear()`
  - `cache.keys()`
  - `getInitialState()`
  - See [graphql-hooks-memcache](packages/graphql-hooks-memcache) as a reference implementation
- `fetch(url, options)`: Fetch implementation - defaults to the global `fetch` API. Check [Request interceptors](#request-interceptors) for more details how to manage `fetch`.
- `FormData`: FormData implementation - defaults to the global `FormData` API. Polyfill this in a node.js environment. See [file-uploads-nodejs](#file-uploads-nodejs) for more info.
- `fetchOptions`: See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch) for info on what options can be passed
- `headers`: Object, e.g. `{ 'My-Header': 'hello' }`
- `logErrors`: Boolean - defaults to `true`
- `middleware`: Accepts an array of middleware functions, default: none, see more in [middlewares readme](packages/graphql-hooks/src/middlewares/README.md)
- `onError({ operation, result })`: Custom error handler
  - `operation`: Object with `query`, `variables` and `operationName`
  - `result`: Object containing `data` and `error` object that contains `fetchError`, `httpError` and `graphqlErrors`

### `client` methods

- `client.setHeader(key, value)`: Updates `client.headers` adding the new header to the existing headers
- `client.setHeaders(headers)`: Replaces `client.headers`
- `client.removeHeader(key)`: Updates `client.headers` removing the header if it exists
- `client.logErrorResult({ operation, result })`: Default error logger; useful if you'd like to use it inside your custom `onError` handler
- `request(operation, options)`: Make a request to your GraphQL server; returning a Promise
  - `operation`: Object with `query`, `variables` and `operationName`
- `options.fetchOptionsOverrides`: Object containing additional fetch options to be added to the default ones passed to `new GraphQLClient(config)`
- `options.responseReducer`: Reducer function to pick values from the original Fetch Response object. Values are merged to the `request` response under the `data` key. Example usage: `{responseReducer: (data, response) => ({...data, myKey: response.headers.get('content-length)})`

## `ClientContext`

`ClientContext` is the result of `React.createContext()` - meaning it can be used directly with React's new context API:

**Example**:

```js
import { ClientContext } from 'graphql-hooks'

function App() {
  return (
    <ClientContext.Provider value={client}>
      {/* children can now consume the client context */}
    </ClientContext.Provider>
  )
}
```

To access the `GraphQLClient` instance, call `React.useContext(ClientContext)`:

```js
import React, { useContext } from 'react'
import { ClientContext } from 'graphql-hooks'

function MyComponent() {
  const client = useContext(ClientContext)
}
```

## `useQuery`

**Usage**:

```js
const state = useQuery(query, [options])
```

**Example:**

```js
import { useQuery } from 'graphql-hooks'

function MyComponent() {
  const { loading, error, data } = useQuery(query)

  if (loading) return 'Loading...'
  if (error) return 'Something bad happened'

  return <div>{data.thing}</div>
}
```

This is a custom hook that takes care of fetching your query and storing the result in the cache. It won't refetch the query unless `query` or `options.variables` changes.

- `query`: Your GraphQL query as a plain string
- `options`: Object with the following optional properties
  - `variables`: Object e.g. `{ limit: 10 }`
  - `operationName`: If your query has multiple operations, pass the name of the operation you wish to execute.
  - `persisted`: Boolean - defaults to `false`; Pass `true` if your graphql server supports `persisted` flag to serve persisted queries.
  - `useCache`: Boolean - defaults to `true`; cache the query result
  - `skip`: Boolean - defaults to `false`; do not execute the query if set to `true`
  - `skipCache`: Boolean - defaults to `false`; If `true` it will by-pass the cache and fetch, but the result will then be cached for subsequent calls. Note the `refetch` function will do this automatically
  - `ssr`: Boolean - defaults to `true`. Set to `false` if you wish to skip this query during SSR
  - `fetchOptionsOverrides`: Object - Specific overrides for this query. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch) for info on what options can be passed
  - `updateData(previousData, data)`: Function - Custom handler for merging previous & new query results; return value will replace `data` in `useQuery` return value
    - `previousData`: Previous GraphQL query or `updateData` result
    - `data`: New GraphQL query result
  - `client`: GraphQLClient - If a GraphQLClient is explicitly passed as an option, then it will be used instead of the client from the `ClientContext`.
  - `refetchAfterMutations`: String | Object | (String | Object)[] - You can specify when a mutation should trigger query refetch.
    - If it's a string, it's the mutation string
    - If it's an object then it has properties mutation and filter
      - `mutation`: String - The mutation string
      - `filter`: Function (optional) - It receives mutation's variables as parameter and blocks refetch if it returns false
    - If it's an array, the elements can be of either type above

### `useQuery` return value

```js
const { loading, error, data, refetch, cacheHit } = useQuery(QUERY)
```

- `loading`: Boolean - `true` if the query is in flight
- `data`: Object - the result of your GraphQL query
- `refetch(options)`: Function - useful when refetching the same query after a mutation; NOTE this presets `skipCache=true` & will bypass the `options.updateData` function that was passed into `useQuery`. You can pass a new `updateData` into `refetch` if necessary.
  - `options`: Object - options that will be merged into the `options` that were passed into `useQuery` (see above).
- `cacheHit`: Boolean - `true` if the query result came from the cache, useful for debugging
- `error`: Object - Set if at least one of the following errors has occurred and contains:
  - `fetchError`: Object - Set if an error occurred during the `fetch` call
  - `httpError`: Object - Set if an error response was returned from the server
  - `graphQLErrors`: Array - Populated if any errors occurred whilst resolving the query

## `useManualQuery`

Use this when you don't want a query to automatically be fetched, or wish to call a query programmatically.

**Usage**:

```js
const [queryFn, state] = useManualQuery(query, [options])
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
import { useManualQuery } from 'graphql-hooks'

function MyComponent(props) {
  const [fetchUser] = useManualQuery(GET_USER_QUERY)

  const fetchUserThenSomething = async () => {
    const user = await fetchUser({
      variables: { id: props.userId }
    })
    return somethingElse()
  }

  return (
    <div>
      <button onClick={fetchUserThenSomething}>Get User!</button>
    </div>
  )
}
```

## `useMutation`

Mutations unlike Queries are not cached.

**Usage**:

```js
const [mutationFn, state, resetFn] = useMutation(mutation, [options])
```

**Example**:

```js
import { useMutation } from 'graphql-hooks'

const UPDATE_USER_MUTATION = `mutation UpdateUser(id: String!, name: String!) {
  updateUser(id: $id, name: $name) {
    name
  }
}`

function MyComponent({ id, name }) {
  const [updateUser] = useMutation(UPDATE_USER_MUTATION)
  const [newName, setNewName] = useState(name)

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
  )
}
```

The `options` object that can be passed either to `useMutation(mutation, options)` or `mutationFn(options)` can be set with the following properties:

- `variables`: Object e.g. `{ limit: 10 }`
- `operationName`: If your query has multiple operations, pass the name of the operation you wish to execute.
- `fetchOptionsOverrides`: Object - Specific overrides for this query. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch) for info on what options can be passed
- `client`: GraphQLClient - If a GraphQLClient is explicitly passed as an option, then it will be used instead of the client from the `ClientContext`.

In addition, there is an option to reset the current state before calling the mutation again, by calling `resetFn(desiredState)` where `desiredState` is optional and if passed, it will override the initial state with:

- `data`: Object - the data
- `error`: Error - the error
- `loading`: Boolean - true if it is still loading
- `cacheHit`: Boolean - true if the result was cached

## `useSubscription`

To use subscription you can use either [subscriptions-transport-ws](https://github.com/apollographql/subscriptions-transport-ws) or [graphql-ws](https://github.com/enisdenjo/graphql-ws)

**API**

`useSubscription(operation, callback)`

- `operation`: Object - The GraphQL operation the following properties:
  - `query`: String (required) - the GraphQL query
  - `variables`: Object (optional) - Any variables the query might need
  - `operationName`: String (optional) - If your query has multiple operations, you can choose which operation you want to call.
  - `client`: GraphQLClient - If a GraphQLClient is explicitly passed as an option, then it will be used instead of the client from the `ClientContext`.
- `callback`: Function - This will be invoked when the subscription receives an event from your GraphQL server - it will receive an object with the typical GraphQL response of `{ data: <your result>, errors?: [Error] }`

**Usage**

First follow the [quick start guide](#Quick-Start) to create the client and povider. Then we need to update the config for our `GraphQLClient` passing in the `subscriptionClient`:

```js
import { GraphQLClient } from 'graphql-hooks'
import { SubscriptionClient } from 'subscriptions-transport-ws'
// or
import { createClient } from 'graphql-ws'

const client = new GraphQLClient({
  url: 'http://localhost:8000/graphql',
  subscriptionClient: () =>
    new SubscriptionClient('ws://localhost:8000/graphql', {
      /* additional config options */
    }),
  // or
  subscriptionClient: () =>
    createClient({
      url: 'ws://localhost:8000/graphql'
      /* additional config options */
    })
})
```

Next, within our React app, we can now make use of the `useSubscription` hook.

```js
import React, { useState } from 'react'
import { useSubscription } from 'graphql-hooks'

const TOTAL_COUNT_SUBSCRIPTION = `
  subscription TotalCount {
    totalCount {
      count
    }
  }
`

function TotalCountComponent() {
  const [count, setCount] = useState(0)
  const [error, setError] = useState(null)

  useSubscription({ query: TOTAL_COUNT_SUBSCRIPTION }, ({ data, errors }) => {
    if (errors && errors.length > 0) {
      // handle your errors
      setError(errors[0])
      return
    }

    // all good, handle the gql result
    setCount(data.totalCount.count)
  })

  if (error) {
    return <span>An error occurred {error.message}</span>
  }

  return <div>Current count: {count}</div>
}
```

**Working Example**:

See our [subscription example](examples/subscription) which has both the client and server code to integrate subscriptions into your application.

See also the [full WS transport example](examples/full-ws-transport) if you want to see how to send every operation through WebSocket.

# Guides

## SSR

See [graphql-hooks-ssr](packages/graphql-hooks-ssr) for an in depth guide.

## Pagination

[GraphQL Pagination](https://graphql.org/learn/pagination/) can be implemented in various ways and it's down to the consumer to decide how to deal with the resulting data from paginated queries. Take the following query as an example of offset pagination:

```javascript
export const allPostsQuery = `
  query allPosts($first: Int!, $skip: Int!) {
    allPosts(first: $first, skip: $skip) {
      id
      title
      url
    }
    _allPostsMeta {
      count
    }
  }
`
```

In this query, the `$first` variable is used to limit the number of posts that are returned and the `$skip` variable is used to determine the offset at which to start. We can use these variables to break up large payloads into smaller chunks, or "pages". We could then choose to display these chunks as distinct pages to the user, or use an infinite loading approach and append each new chunk to the existing list of posts.

### Separate pages

Here is an example where we display the paginated queries on separate pages:

```jsx
import { React, useState } from 'react'
import { useQuery } from 'graphql-hooks'

export default function PostList() {
  // set a default offset of 0 to load the first page
  const [skipCount, setSkipCount] = useState(0)

  const { loading, error, data } = useQuery(allPostsQuery, {
    variables: { skip: skipCount, first: 10 }
  })

  if (error) return <div>There was an error!</div>
  if (loading && !data) return <div>Loading</div>

  const { allPosts, _allPostsMeta } = data
  const areMorePosts = allPosts.length < _allPostsMeta.count

  return (
    <section>
      <ul>
        {allPosts.map(post => (
          <li key={post.id}>
            <a href={post.url}>{post.title}</a>
          </li>
        ))}
      </ul>
      <button
        // reduce the offset by 10 to fetch the previous page
        onClick={() => setSkipCount(skipCount - 10)}
        disabled={skipCount === 0}
      >
        Previous page
      </button>
      <button
        // increase the offset by 10 to fetch the next page
        onClick={() => setSkipCount(skipCount + 10)}
        disabled={!areMorePosts}
      >
        Next page
      </button>
    </section>
  )
}
```

### Infinite loading

Here is an example where we append each paginated query to the bottom of the current list:

```jsx
import { React, useState } from 'react'
import { useQuery } from 'graphql-hooks'

// use options.updateData to append the new page of posts to our current list of posts
const updateData = (prevData, data) => ({
  ...data,
  allPosts: [...prevData.allPosts, ...data.allPosts]
})

export default function PostList() {
  const [skipCount, setSkipCount] = useState(0)

  const { loading, error, data } = useQuery(allPostsQuery, {
    variables: { skip: skipCount, first: 10 },
    updateData
  })

  if (error) return <div>There was an error!</div>
  if (loading && !data) return <div>Loading</div>

  const { allPosts, _allPostsMeta } = data
  const areMorePosts = allPosts.length < _allPostsMeta.count

  return (
    <section>
      <ul>
        {allPosts.map(post => (
          <li key={post.id}>
            <a href={post.url}>{post.title}</a>
          </li>
        ))}
      </ul>
      {areMorePosts && (
        <button
          // set the offset to the current number of posts to fetch the next page
          onClick={() => setSkipCount(allPosts.length)}
        >
          Show more
        </button>
      )}
    </section>
  )
}
```

## Refetch queries with mutations subscription

We can have a query to automatically refetch when any mutation from a provided list execute.
In the following example we are refetching a list of posts for a given user.

**Example**

```jsx
export const allPostsByUserIdQuery = `
  query allPosts($userId: Int!) {
    allPosts(userId: $userId) {
      id
      title
      url
    }
  }
`

export const createPostMutation = `
  mutation createPost($userId: Int!, $text: String!) {
    createPost(userId: $userId, text: $text) {
      id
      title
      url
    }
  }
`

const myUserId = 5

useQuery(allPostsByUserIdQuery, {
  variables: {
    userId: myUserId
  },
  refetchAfterMutations: [
    {
      mutation: createPostMutation,
      filter: variables => variables.userId === myUserId
    }
  ]
})
```

## File uploads

`graphql-hooks` complies with the [GraphQL multipart request spec](https://github.com/jaydenseric/graphql-multipart-request-spec), allowing files to be used as query or mutation arguments. The same spec is also supported by popular GraphQL servers, including [Apollo Server](https://www.apollographql.com/docs/apollo-server) (see list of supported servers [here](https://github.com/jaydenseric/graphql-multipart-request-spec#server)).

If there are files to upload, the request's body will be a [`FormData`](https://developer.mozilla.org/docs/Web/API/FormData) instance conforming to the GraphQL multipart request spec.

```jsx
import React, { useRef } from 'react'
import { useMutation } from 'graphql-hooks'

const uploadPostPictureMutation = `
  mutation UploadPostPicture($picture: Upload!) {
    uploadPostPicture(picture: $picture) {
      id
      pictureUrl
    }
  }
`

export default function PostForm() {
  // File input is always uncontrolled in React.
  // See: https://reactjs.org/docs/uncontrolled-components.html#the-file-input-tag.
  const fileInputRef = useRef(null)

  const [uploadPostPicture] = useMutation(uploadPostPictureMutation)

  const handleSubmit = event => {
    event.preventDefault()

    uploadPostPicture({
      variables: {
        picture: fileInputRef.current.files[0]
      }
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <input accept="image/*" ref={fileInputRef} type="file" />
      <button>Upload</button>
    </form>
  )
}
```

### File uploads Node.js

```js
import { FormData } = from 'formdata-node'
import { fileFromPath } = from 'formdata-node/file-from-path'

const client = new GraphQLClient({
  url: 'https://domain.com/graphql',
  fetch: require('node-fetch'),
  FormData
})

const uploadPostPictureMutation = `
  mutation UploadPostPicture($picture: Upload!) {
    uploadPostPicture(picture: $picture) {
      id
      pictureUrl
    }
  }
`

const { data, error } = await client.request({
  query: uploadPostPictureMutation,
  variables: { picture: await fileFromPath('some-file.txt') }
})
```

## HTTP Get support

Using `GET` for queries can be useful, especially when implementing any sort of HTTP caching strategy. There are two ways you can do this:

**Per Query**

```js
const { loading, error, data } = useQuery(MY_QUERY, {
  fetchOptionsOverrides: { method: 'GET' }
})

// same goes for useManualQuery
const [fetchSomething] = useManualQuery(MY_QUERY, {
  fetchOptionsOverrides: { method: 'GET' }
})
```

**For All Queries**

When you create your client, set the `useGETForQueries` option as `true`:

```js
const client = new GraphQLClient({
  url: '/graphql',
  useGETForQueries: true
})
```

## Authentication

You can have access the to the graphql-hooks client context by using the React's new context API. `ClientContext` is actually the result of `React.createContext()`.

**Login example**

```jsx
import React, { useState, useContext } from 'react'
import { useMutation, ClientContext } from 'graphql-hooks'

const LOGIN_MUTATION = `mutation LoginUser (name: String!, password: String!) {
  loginUser(name: $name, password: $password) {
    token
  }
}`

const Login = () => {
  const client = useContext(ClientContext)
  const [loginUserMutation] = useMutation(LOGIN_MUTATION)
  const [userName, setUserName] = useState()
  const [password, setPassword] = useState()

  const handleLogin = async e => {
    e.preventDefault()
    const { data, error } = await loginUserMutation({
      variables: { userName, password }
    })
    if (error) {
      // your code to handle login error
    } else {
      const { token } = data.loginUser
      client.setHeader('Authorization', `Bearer ${token}`)
      // your code to handle token in browser and login redirection
    }
  }
  return (
    <form onSubmit={handleLogin}>
      User Name:{' '}
      <input
        type={'text'}
        value={userName}
        onChange={e => setUserName(e.target.value)}
      />
      PassWord: <input
        type={'password'}
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <input type={'submit'} value={'Login'} />
    </form>
  )
}

export default Login
```

In the above example we use `useContext()` hook to get access to the graphql-hooks clientContext.
Then we request the token from the server by performing the `loginUser` mutation.
In the case the login is success we set the token to the client's header (`client.setHeader`), otherwise we need to handle the error.
For more information about graphql-hooks clientContext refer to [GraphQLClient](#GraphQLClient) section.

## Fragments

Coming soon!

## Migrating from Apollo

For a real life example, compare the next.js [with-apollo](https://github.com/zeit/next.js/tree/canary/examples/with-apollo) vs [with-graphql-hooks](https://github.com/zeit/next.js/tree/canary/examples/with-graphql-hooks). We have feature parity and the `main-*.js` bundle is a whopping **93% smaller** (7.9KB vs 116KB).

### ApolloClient ➡️ GraphQLClient

```diff
- import { ApolloClient } from 'apollo-client'
- import { InMemoryCache } from 'apollo-cache-inmemory'
+ import { GraphQLClient } from 'graphql-hooks'
+ import memCache from 'graphql-hooks-memcache'

- const client = new ApolloClient({
-  uri: '/graphql',
-  cache: new InMemoryCache()
- })
+ const client = new GraphQLClient({
+   url: '/graphql',
+   cache: memCache()
+ })
```

A lot of the options you'd pass to `ApolloClient` are the same as `GraphQLClient`:

- `uri` ➡️ `url`
- `fetchOptions`
- `onError` - the function signature is slightly different
- `headers`
- `fetch`
- `cache`

### ApolloProvider ➡️ ClientContext.Provider

```diff
- import { ApolloProvider } from 'react-apollo'
+ import { ClientContext } from 'graphql-hooks'

function App({ client }) {
  return (
-    <ApolloProvider client={client}>
+    <ClientContext.Provider value={client}>
       {/* children */}
+    </ClientContext.Provider>
-    </ApolloProvider>
  )
}
```

### Query Component ➡️ useQuery

```diff
- import { Query } from 'react-apollo'
- import gql from 'graphql-tag'
+ import { useQuery } from 'graphql-hooks'

function MyComponent() {
+ const { loading, error, data } = useQuery('...')

-  return (
-    <Query query={gql`...`}>
-     {({ loading, error, data}) => {
        if (loading) return 'Loading...'
        if (error) return 'Error :('

        return <div>{data}</div>
-      }}
-    </Query>
-  )
}
```

### Query Component Props

A lot of options can be carried over as-is, or have direct replacements:

- `query` ➡️ `useQuery(query)`: Remove any usage of `gql` and pass your queries as strings.
- `variables` ➡️ `useQuery(query, { variables })`
- `ssr` ➡️ `useQuery(query, { ssr })`
- **Fetch Policies**: See [#75](https://github.com/nearform/graphql-hooks/issues/75) for more info
  - `cache-first`: This the default behaviour of `graphql-hooks`
  - `cache-and-network`: The refetch function provides this behaviour it will set loading: true, but the old data will be still set until the fetch resolves.
  - `network-only` ➡️ `useQuery(QUERY, { skipCache: true })`
  - `cache-only`: Not supported
  - `no-cache` ➡️ `useQuery(QUERY, { useCache: false })`

**Not yet supported**

- `errorPolicy`: Any error will set the `error` to be truthy. See [useQuery](#useQuery) for more details.
- `pollInterval`
- `notifyOnNetworkStatusChange`
- `skip`
- `onCompleted`: Similar ability if using `useManualQuery`
- `onError`: Similar ability if using `useManualQuery`
- `partialRefetch`

### Query Component Render Props

```diff
- <Query query={gql`...`}>
-  {(props) => {}}
- </Query>
+ const state = useQuery(`...`)
```

- `props.loading` ➡️ `const { loading } = useQuery('...')`
- `props.error` ➡️ `const { error } = useQuery('...')`: The error value from `useQuery` is Boolean the details of the error can be found in either:
  - `state.fetchError`
  - `state.httpError`
  - `state.graphQLErrors`
- `props.refetch` ️➡️ `const { refetch } = useQuery('...')`
- `props.updateData(prevResult, options)` ️➡️ `state.updateData(prevResult, newResult)`

**Not yet supported**

- `props.networkStatus`
- `props.startPolling`
- `props.stopPolling`
- `props.subscribeToMore`

### Mutation Component ➡️ useMutation

```diff
- import { Mutation } from 'react-apollo'
- import gql from 'graphql-tag'
+ import { useMutation } from 'graphql-hooks'

function MyComponent() {
+ const [mutateFn, { loading, error, data }] = useMutation('...')

-  return (
-    <Mutation mutation={gql`...`}>
-     {(mutateFn, { loading, error }) => {
        if (error) return 'Error :('

        return <button disabled={loading} onClick={() => mutateFn()}>Submit</button>
-      }}
-    </Mutation>
-  )
}
```

### Mutation Props

- `mutation` ➡️ `useMutation(mutation)` - no need to wrap it in `gql`
- `variables` ➡️️ `useMutation(mutation, { variables })` or `mutateFn({ variables })`
- `ignoreResults` ➡️️️️ `const [mutateFn] = useMutation(mutation)`
- `onCompleted` ➡️ ️`mutateFn().then(onCompleted)`
- `onError` ➡️ `mutateFn().then(({ error }) => {...})`

**Not yet supported**

- `update`: Coming soon [#52](https://github.com/nearform/graphql-hooks/issues/52)
- `optimisticResponse`
- `refetchQueries`
- `awaitRefetchQueries`
- `context`

## Mutation Component Render Props

```diff
- <Mutation mutation={gql`...`}>
-  {(mutateFn, props) => {}}
- </Mutation>
+ const [mutateFn, state] = useMutation(`...`)
```

- `props.data` ➡️ `const [mutateFn, { data }] = useMutation()`
- `props.loading` ➡️ `const [mutateFn, { loading }] = useMutation()`
- `props.error` ➡️ `const [mutateFn, { error }] = useMutation()`: The the details of the error can be found in either:
  - `state.fetchError`
  - `state.httpError`
  - `state.graphQLErrors`
- `client` ️➡️️ `const client = useContext(ClientContext)` see [ClientContext](#ClientContext)

**Not yet supported**

- `called`

## Other

### Request interceptors

It is possible to provide a custom library to handle network requests. Having that there is more control on how to handle the requests. The following example shows how to supply axios HTTP client with interceptors. It can be handy in the situations where JWT token has expired, needs to be refreshed and request retried.

```js
import axios from 'axios'
import { buildAxiosFetch } from '@lifeomic/axios-fetch'
import { GraphQLClient } from 'graphql-hooks'

const gqlAxios = axios.create()
gqlAxios.interceptors.response.use(
  function (response) {
    return response
  },
  function (error) {
    // Handle expired JWT and refresh token
  }
)

const client = new GraphQLClient({
  url: '/graphql',
  fetch: buildAxiosFetch(gqlAxios)
})
```

## Community

We now use GitHub Discussions for our community. To join, click on ["Discussions"](https://github.com/nearform/graphql-hooks/discussions). We encourage you to start a new discussion, share some ideas or ask questions from the community.
If you want to see the old community posts (on Spectrum) you can access them [here](https://spectrum.chat/graphql-hooks).

## Contributors

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://twitter.com/bmullan91"><img src="https://avatars1.githubusercontent.com/u/1939483?v=4" width="100px;" alt=""/><br /><sub><b>Brian Mullan</b></sub></a><br /><a href="#question-bmullan91" title="Answering Questions">💬</a> <a href="https://github.com/nearform/graphql-hooks/issues?q=author%3Abmullan91" title="Bug reports">🐛</a> <a href="https://github.com/nearform/graphql-hooks/commits?author=bmullan91" title="Code">💻</a> <a href="#content-bmullan91" title="Content">🖋</a> <a href="https://github.com/nearform/graphql-hooks/commits?author=bmullan91" title="Documentation">📖</a> <a href="#example-bmullan91" title="Examples">💡</a> <a href="#ideas-bmullan91" title="Ideas, Planning, & Feedback">🤔</a> <a href="#maintenance-bmullan91" title="Maintenance">🚧</a> <a href="https://github.com/nearform/graphql-hooks/pulls?q=is%3Apr+reviewed-by%3Abmullan91" title="Reviewed Pull Requests">👀</a> <a href="https://github.com/nearform/graphql-hooks/commits?author=bmullan91" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://jackdc.com"><img src="https://avatars0.githubusercontent.com/u/1485654?v=4" width="100px;" alt=""/><br /><sub><b>Jack Clark</b></sub></a><br /><a href="#question-jackdclark" title="Answering Questions">💬</a> <a href="https://github.com/nearform/graphql-hooks/issues?q=author%3Ajackdclark" title="Bug reports">🐛</a> <a href="https://github.com/nearform/graphql-hooks/commits?author=jackdclark" title="Code">💻</a> <a href="#content-jackdclark" title="Content">🖋</a> <a href="https://github.com/nearform/graphql-hooks/commits?author=jackdclark" title="Documentation">📖</a> <a href="#example-jackdclark" title="Examples">💡</a> <a href="#ideas-jackdclark" title="Ideas, Planning, & Feedback">🤔</a> <a href="#maintenance-jackdclark" title="Maintenance">🚧</a> <a href="https://github.com/nearform/graphql-hooks/pulls?q=is%3Apr+reviewed-by%3Ajackdclark" title="Reviewed Pull Requests">👀</a> <a href="https://github.com/nearform/graphql-hooks/commits?author=jackdclark" title="Tests">⚠️</a></td>
    <td align="center"><a href="http://twitter.com/joezo"><img src="https://avatars1.githubusercontent.com/u/2870255?v=4" width="100px;" alt=""/><br /><sub><b>Joe Warren</b></sub></a><br /><a href="#question-Joezo" title="Answering Questions">💬</a> <a href="https://github.com/nearform/graphql-hooks/issues?q=author%3AJoezo" title="Bug reports">🐛</a> <a href="https://github.com/nearform/graphql-hooks/commits?author=Joezo" title="Code">💻</a> <a href="#content-Joezo" title="Content">🖋</a> <a href="https://github.com/nearform/graphql-hooks/commits?author=Joezo" title="Documentation">📖</a> <a href="#example-Joezo" title="Examples">💡</a> <a href="#ideas-Joezo" title="Ideas, Planning, & Feedback">🤔</a> <a href="#maintenance-Joezo" title="Maintenance">🚧</a> <a href="https://github.com/nearform/graphql-hooks/pulls?q=is%3Apr+reviewed-by%3AJoezo" title="Reviewed Pull Requests">👀</a> <a href="https://github.com/nearform/graphql-hooks/commits?author=Joezo" title="Tests">⚠️</a></td>
    <td align="center"><a href="http://simoneb.github.io"><img src="https://avatars1.githubusercontent.com/u/20181?v=4" width="100px;" alt=""/><br /><sub><b>Simone Busoli</b></sub></a><br /><a href="#question-simoneb" title="Answering Questions">💬</a> <a href="https://github.com/nearform/graphql-hooks/issues?q=author%3Asimoneb" title="Bug reports">🐛</a> <a href="https://github.com/nearform/graphql-hooks/commits?author=simoneb" title="Documentation">📖</a></td>
    <td align="center"><a href="https://jheytompkins.com"><img src="https://avatars1.githubusercontent.com/u/842246?v=4" width="100px;" alt=""/><br /><sub><b>jhey tompkins</b></sub></a><br /><a href="https://github.com/nearform/graphql-hooks/commits?author=jh3y" title="Tests">⚠️</a> <a href="#question-jh3y" title="Answering Questions">💬</a> <a href="https://github.com/nearform/graphql-hooks/issues?q=author%3Ajh3y" title="Bug reports">🐛</a> <a href="https://github.com/nearform/graphql-hooks/commits?author=jh3y" title="Code">💻</a> <a href="#content-jh3y" title="Content">🖋</a> <a href="https://github.com/nearform/graphql-hooks/pulls?q=is%3Apr+reviewed-by%3Ajh3y" title="Reviewed Pull Requests">👀</a></td>
    <td align="center"><a href="https://haroen.me"><img src="https://avatars3.githubusercontent.com/u/6270048?v=4" width="100px;" alt=""/><br /><sub><b>Haroen Viaene</b></sub></a><br /><a href="https://github.com/nearform/graphql-hooks/issues?q=author%3AHaroenv" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/aribouius"><img src="https://avatars2.githubusercontent.com/u/10748727?v=4" width="100px;" alt=""/><br /><sub><b>Ari Bouius</b></sub></a><br /><a href="https://github.com/nearform/graphql-hooks/commits?author=aribouius" title="Documentation">📖</a> <a href="https://github.com/nearform/graphql-hooks/issues?q=author%3Aaribouius" title="Bug reports">🐛</a> <a href="https://github.com/nearform/graphql-hooks/commits?author=aribouius" title="Code">💻</a> <a href="https://github.com/nearform/graphql-hooks/commits?author=aribouius" title="Tests">⚠️</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/kkogovsek"><img src="https://avatars1.githubusercontent.com/u/8089644?v=4" width="100px;" alt=""/><br /><sub><b>Klemen Kogovšek</b></sub></a><br /><a href="https://github.com/nearform/graphql-hooks/issues?q=author%3Akkogovsek" title="Bug reports">🐛</a> <a href="#ideas-kkogovsek" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/nearform/graphql-hooks/commits?author=kkogovsek" title="Code">💻</a> <a href="https://github.com/nearform/graphql-hooks/commits?author=kkogovsek" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://github.com/wescoder"><img src="https://avatars0.githubusercontent.com/u/22945955?v=4" width="100px;" alt=""/><br /><sub><b>Wésley Queiroz</b></sub></a><br /><a href="https://github.com/nearform/graphql-hooks/issues?q=author%3Awescoder" title="Bug reports">🐛</a> <a href="https://github.com/nearform/graphql-hooks/commits?author=wescoder" title="Code">💻</a></td>
    <td align="center"><a href="https://www.good-idea.studio"><img src="https://avatars3.githubusercontent.com/u/11514928?v=4" width="100px;" alt=""/><br /><sub><b>Joseph Thomas</b></sub></a><br /><a href="https://github.com/nearform/graphql-hooks/issues?q=author%3Agood-idea" title="Bug reports">🐛</a> <a href="https://github.com/nearform/graphql-hooks/commits?author=good-idea" title="Code">💻</a> <a href="https://github.com/nearform/graphql-hooks/commits?author=good-idea" title="Tests">⚠️</a></td>
    <td align="center"><a href="http://edvinasbartkus.lt"><img src="https://avatars0.githubusercontent.com/u/202988?v=4" width="100px;" alt=""/><br /><sub><b>Edvinas Bartkus</b></sub></a><br /><a href="https://github.com/nearform/graphql-hooks/commits?author=edvinasbartkus" title="Code">💻</a> <a href="#question-edvinasbartkus" title="Answering Questions">💬</a> <a href="https://github.com/nearform/graphql-hooks/issues?q=author%3Aedvinasbartkus" title="Bug reports">🐛</a> <a href="https://github.com/nearform/graphql-hooks/commits?author=edvinasbartkus" title="Documentation">📖</a> <a href="#example-edvinasbartkus" title="Examples">💡</a> <a href="#ideas-edvinasbartkus" title="Ideas, Planning, & Feedback">🤔</a> <a href="#maintenance-edvinasbartkus" title="Maintenance">🚧</a> <a href="https://github.com/nearform/graphql-hooks/pulls?q=is%3Apr+reviewed-by%3Aedvinasbartkus" title="Reviewed Pull Requests">👀</a> <a href="https://github.com/nearform/graphql-hooks/commits?author=edvinasbartkus" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://github.com/olistic"><img src="https://avatars1.githubusercontent.com/u/5600126?v=4" width="100px;" alt=""/><br /><sub><b>Matías Olivera</b></sub></a><br /><a href="https://github.com/nearform/graphql-hooks/issues?q=author%3Aolistic" title="Bug reports">🐛</a> <a href="https://github.com/nearform/graphql-hooks/commits?author=olistic" title="Code">💻</a> <a href="https://github.com/nearform/graphql-hooks/commits?author=olistic" title="Tests">⚠️</a> <a href="https://github.com/nearform/graphql-hooks/commits?author=olistic" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/tcudok-jg"><img src="https://avatars3.githubusercontent.com/u/50208575?v=4" width="100px;" alt=""/><br /><sub><b>tcudok-jg</b></sub></a><br /><a href="https://github.com/nearform/graphql-hooks/commits?author=tcudok-jg" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/heymartinadams"><img src="https://avatars2.githubusercontent.com/u/11673745?v=4" width="100px;" alt=""/><br /><sub><b>Martin Adams</b></sub></a><br /><a href="https://github.com/nearform/graphql-hooks/commits?author=heymartinadams" title="Documentation">📖</a></td>
  </tr>
  <tr>
    <td align="center"><a href="http://gal.js.org"><img src="https://avatars3.githubusercontent.com/u/191608?v=4" width="100px;" alt=""/><br /><sub><b>Gal Dubitski</b></sub></a><br /><a href="https://github.com/nearform/graphql-hooks/commits?author=galmail" title="Code">💻</a> <a href="https://github.com/nearform/graphql-hooks/issues?q=author%3Agalmail" title="Bug reports">🐛</a> <a href="https://github.com/nearform/graphql-hooks/commits?author=galmail" title="Documentation">📖</a> <a href="https://github.com/nearform/graphql-hooks/commits?author=galmail" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://twitter.com/osdevisnot"><img src="https://avatars1.githubusercontent.com/u/802242?v=4" width="100px;" alt=""/><br /><sub><b>Abhishek Shende</b></sub></a><br /><a href="https://github.com/nearform/graphql-hooks/commits?author=osdevisnot" title="Code">💻</a> <a href="https://github.com/nearform/graphql-hooks/issues?q=author%3Aosdevisnot" title="Bug reports">🐛</a></td>
    <td align="center"><a href="http://fabien.cool"><img src="https://avatars1.githubusercontent.com/u/1702255?v=4" width="100px;" alt=""/><br /><sub><b>fabienheureux</b></sub></a><br /><a href="https://github.com/nearform/graphql-hooks/pulls?q=is%3Apr+reviewed-by%3Afabienheureux" title="Reviewed Pull Requests">👀</a></td>
    <td align="center"><a href="https://hughboylan.com"><img src="https://avatars2.githubusercontent.com/u/2158740?v=4" width="100px;" alt=""/><br /><sub><b>Hugh Boylan</b></sub></a><br /><a href="https://github.com/nearform/graphql-hooks/pulls?q=is%3Apr+reviewed-by%3Ahboylan" title="Reviewed Pull Requests">👀</a></td>
    <td align="center"><a href="https://github.com/bmamouri"><img src="https://avatars2.githubusercontent.com/u/6419173?v=4" width="100px;" alt=""/><br /><sub><b>Baqer Mamouri</b></sub></a><br /><a href="https://github.com/nearform/graphql-hooks/commits?author=bmamouri" title="Code">💻</a></td>
    <td align="center"><a href="http://www.netnotion.com"><img src="https://avatars0.githubusercontent.com/u/17315?v=4" width="100px;" alt=""/><br /><sub><b>Guillermo Gonzalez </b></sub></a><br /><a href="https://github.com/nearform/graphql-hooks/commits?author=helloguille" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/brookback"><img src="https://avatars0.githubusercontent.com/u/30257156?v=4" width="100px;" alt=""/><br /><sub><b>Johan Brook</b></sub></a><br /><a href="https://github.com/nearform/graphql-hooks/commits?author=brookback" title="Code">💻</a> <a href="https://github.com/nearform/graphql-hooks/issues?q=author%3Abrookback" title="Bug reports">🐛</a> <a href="#maintenance-brookback" title="Maintenance">🚧</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/frikille"><img src="https://avatars2.githubusercontent.com/u/569278?v=4" width="100px;" alt=""/><br /><sub><b>Peter Balazs</b></sub></a><br /><a href="https://github.com/nearform/graphql-hooks/commits?author=frikille" title="Code">💻</a> <a href="https://github.com/nearform/graphql-hooks/commits?author=frikille" title="Documentation">📖</a> <a href="#example-frikille" title="Examples">💡</a> <a href="https://github.com/nearform/graphql-hooks/commits?author=frikille" title="Tests">⚠️</a></td>
    <td align="center"><a href="http://panz3r.dev"><img src="https://avatars3.githubusercontent.com/u/1754457?v=4" width="100px;" alt=""/><br /><sub><b>Mattia Panzeri</b></sub></a><br /><a href="https://github.com/nearform/graphql-hooks/commits?author=panz3r" title="Code">💻</a> <a href="https://github.com/nearform/graphql-hooks/commits?author=panz3r" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://github.com/lynxtaa"><img src="https://avatars1.githubusercontent.com/u/22496946?v=4" width="100px;" alt=""/><br /><sub><b>Alex Kondratyuk</b></sub></a><br /><a href="https://github.com/nearform/graphql-hooks/commits?author=lynxtaa" title="Code">💻</a> <a href="https://github.com/nearform/graphql-hooks/commits?author=lynxtaa" title="Tests">⚠️</a> <a href="https://github.com/nearform/graphql-hooks/commits?author=lynxtaa" title="Documentation">📖</a> <a href="https://github.com/nearform/graphql-hooks/issues?q=author%3Alynxtaa" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/cepelinc"><img src="https://avatars1.githubusercontent.com/u/25613873?v=4" width="100px;" alt=""/><br /><sub><b>Matias Cepeda</b></sub></a><br /><a href="https://github.com/nearform/graphql-hooks/commits?author=cepelinc" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/jackh726"><img src="https://avatars1.githubusercontent.com/u/31162821?v=4" width="100px;" alt=""/><br /><sub><b>Jack Huey</b></sub></a><br /><a href="https://github.com/nearform/graphql-hooks/issues?q=author%3Ajackh726" title="Bug reports">🐛</a> <a href="https://github.com/nearform/graphql-hooks/commits?author=jackh726" title="Code">💻</a> <a href="https://github.com/nearform/graphql-hooks/commits?author=jackh726" title="Documentation">📖</a> <a href="https://github.com/nearform/graphql-hooks/commits?author=jackh726" title="Tests">⚠️</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
