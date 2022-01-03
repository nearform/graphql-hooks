# graphql-hooks-ssr

Server-side rendering utils for `graphql-hooks`

## Install

`npm install graphql-hooks-ssr`

or

`yarn add graphql-hooks-ssr`

## Quick Start

The below example is for `fastify` but the same principles apply for `express` & `hapi`.

```js
const { GraphQLClient, ClientContext } = require('graphql-hooks')
const memCache = require('graphql-hooks-memcache')
const { getInitialState } = require('graphql-hooks-ssr')
const { ServerLocation } = require('@reach/router')
// NOTE: use can use any 'fetch' polyfill
const fetch = require('isomorphic-unfetch')

app.get('/', async (req, reply) => {
  // Step 1: Create the client inside the request handler
  const client = new GraphQLClient({
    url: 'https://domain.com/graphql',
    cache: memCache(), // NOTE: a cache is required for SSR
    fetch
  })

  // Step 2: Provide the `client`
  // Optional: If your app contains a router, you'll need to tell it which route the user is on
  // based on the request.. this example uses @reach/router
  const App = (
    <ClientContext.Provider value={client}>
      <ServerLocation url={req.raw.url}>
        {/* Your App component goes here */}
      </ServerLocation>
    </ClientContext.Provider>
  )

  // Step 3: Use the getInitialState method from graphql-hooks-ssr
  // Pass in App + GraphQL client
  const initialState = await getInitialState({ App, client })

  // Step 4: Render the your App - all queries will now be cached
  const content = ReactDOMServer.renderToString(App)

  // Step 5: Serialise the initialState object + include it in the html payload
  const html = `
      <!DOCTYPE html>
      <html>
        <body>
          <div id="app-root">${content}</div>
          <script type="text/javascript">
            window.__INITIAL_STATE__=${JSON.stringify(initialState).replace(
              /</g,
              '\\u003c'
            )};
          </script>
        </body>
      </html>
    `

  reply.type('text/html').send(html)
})
```

### API

#### `getInitialState(options)`

Returns the serialisable cache after fetching all queries.

- `options.App`: The react component to render
- `options.client`: An instance of `GraphQLClient` from `graphql-hooks`
- `options.render`: A custom render function; defaults to `ReactDOMServer.renderToStaticMarkup`
