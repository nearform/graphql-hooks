import path from 'path'
import fastify from 'fastify'

// plugins
import graphqlPlugin from './graphql/index.js'
import fastifyStatic from '@fastify/static'

// handlers
import appShellHandler from './handlers/app-shell.js'

const startServer = () => {
  const app = fastify({
    logger: true
  })

  app.register(fastifyStatic, {
    root: path.join(process.cwd(), 'build/public')
  })

  app.register(graphqlPlugin)

  app.get('/', appShellHandler)
  app.get('/users', appShellHandler)

  app.listen({ port: 3000 })
}

export default startServer
