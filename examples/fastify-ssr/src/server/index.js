const path = require('path')
const fastify = require('fastify')

// plugins
const graphqlPlugin = require('./graphql')

// handlers
const appShellHandler = require('./handlers/app-shell')

module.exports = () => {
  const app = fastify({
    logger: true
  })

  app.register(require('fastify-static'), {
    root: path.join(process.cwd(), 'build/public')
  })

  app.register(graphqlPlugin)

  app.get('/test', async function(req, reply) {
    const query = '{ add(x: 2, y: 2) }'
    return reply.graphql(query)
  })

  app.get('/', appShellHandler)
  app.get('/users', appShellHandler)

  app.listen(3000)
}
