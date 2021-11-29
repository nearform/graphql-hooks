import React from 'react'
import ReactDOMServer from 'react-dom/server.js'
import ReactRouterDom from 'react-router-dom'
const { StaticRouter } = ReactRouterDom

// graphql-hooks
import { getInitialState } from 'graphql-hooks-ssr'
import { GraphQLClient, ClientContext } from 'graphql-hooks'
import memCache from 'graphql-hooks-memcache'

// components
import AppShell from '../../app/AppShell.js'

// helpers
import { getBundlePath } from '../helpers/manifest.js'
import unfetch from 'isomorphic-unfetch'

function renderHead() {
  return `
    <head>
      <title>Hello World!</title>
    </head>
  `
}

async function renderScripts({ initialState }) {
  const appShellBundlePath = await getBundlePath('app-shell.js')
  return `
    <script type="text/javascript">
      window.__INITIAL_STATE__=${JSON.stringify(initialState).replace(
        /</g,
        '\\u003c'
      )};
    </script>
    <script src="${appShellBundlePath}"></script>
  `
}

async function appShellHandler(req, reply) {
  const head = renderHead()

  const client = new GraphQLClient({
    url: 'http://127.0.0.1:3000/graphql',
    cache: memCache(),
    fetch: unfetch,
    logErrors: true
  })

  const App = () => (
    <StaticRouter location={req.raw.url}>
      <ClientContext.Provider value={client}>
        <AppShell />
      </ClientContext.Provider>
    </StaticRouter>
  )

  const initialState = await getInitialState({ App, client })
  const content = ReactDOMServer.renderToString(App)
  const scripts = await renderScripts({ initialState })

  const html = `
      <!DOCTYPE html>
      <html>
        ${head}
        <body>
          <div id="app-root">${content}</div>
          ${scripts}
        </body>
      </html>
    `

  reply.type('text/html').send(html)
}

export default appShellHandler
