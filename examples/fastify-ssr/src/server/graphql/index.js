import mercurius from 'mercurius'

import schema from './schema.js'
import resolvers from './resolvers.js'

function registerGraphQL(fastify, opts, next) {
  fastify.register(mercurius, {
    schema,
    resolvers,
    graphiql: true
  })

  next()
}

registerGraphQL[Symbol.for('skip-override')] = true

export default registerGraphQL
