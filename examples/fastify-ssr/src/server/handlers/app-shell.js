const React = require('react')
const ReactDOMServer = require('react-dom/server')
const { StaticRouter } = require('react-router')

// graphql-hooks
const { getInitialState } = require('graphql-hooks-ssr')
const { GraphQLClient, ClientContext } = require('graphql-hooks')
const memCache = require('graphql-hooks-memcache')

// components
const { default: AppShell } = require('../../app/AppShell')

// helpers
const { getBundlePath } = require('../helpers/manifest')

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
    fetch: require('isomorphic-unfetch'),
    logErrors: true
  })

  const App = (
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

module.exports = appShellHandler
