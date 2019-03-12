const ReactDOMServer = require('react-dom/server')

async function getInitialState(opts) {
  const { App, client, render = ReactDOMServer.renderToStaticMarkup } = opts

  if (!client.cache) {
    throw new Error(
      'A cache implementation must be provided for SSR, please pass one to `GraphQLClient` via `options`.'
    )
  }

  // ensure ssrMode is set:
  client.ssrMode = true
  render(App)

  if (client.ssrPromises.length) {
    await Promise.all(client.ssrPromises)
    // clear promises
    client.ssrPromises = []
    // recurse there may be dependant queries
    return getInitialState(opts)
  } else {
    return client.cache.getInitialState()
  }
}

module.exports = {
  getInitialState
}
