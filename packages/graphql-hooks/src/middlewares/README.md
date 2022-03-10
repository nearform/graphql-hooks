# GraphQLClient Middleware

A middleware gives you the option to access and intercept requests before and after they are performed.

In GraphQLClient the middleware functions are passed in the GraphQLClient's config under the `middleware` key. They are executed in the given order.

## Minimal example

```js
const LoggerMiddleware = ({ operation }, next) => {
    console.log('Starting request:', operation)
    next()
  }
}
```

## Parameters

Middleware is a function with 2 parameters:

- `options` object:
  - `operation` - GraphQL operation object - includes `query`, `variables` etc.
  - `addResponseHook` - a function that can be called from within the middleware to add a response hook - it accepts a handler to read/transform and return the data - passthrough ex.: `addResponseHook(response => response)`
  - `client` - the GraphQLClient instance
  - `resolve`, `reject` - advanced usage only, these would be used only when we want to resolve/reject the request `Promise` early without doing the usual fetch (see [example](examples/cacheMiddleware.js))
- `next` function - calls the next middleware function in line. Generally it should always be called, unless we want to change the control flow

## More examples

See [examples folder](examples/)

### Update response post-request

```js
const camelCaseMiddleware = ({ operation, addResponseHook }, next) => {
  addResponseHook(response => {
    // Need to return
    return toCamelCaseDeep(response)
  })
  // Continue executing the next middleware
  next()
}
```

### Change the control flow (async)

```js
const healthCheckMiddleware = async ({ operation, client, reject }, next) => {
  const isWorking = await client.request('/health')
  if (isWorking) {
    // Everything's good, fire the request
    next()
  } else {
    // Server is down, don't continue in the middleware execution and fail the req early
    reject({ message: 'Server is down' })
  }
}
```
