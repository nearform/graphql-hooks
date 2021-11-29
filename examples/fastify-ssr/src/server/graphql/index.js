import fastifyGQL from 'fastify-gql'

import schema from './schema.js'
import resolvers from './resolvers.js'

function registerGraphQL(fastify, opts, next) {
  fastify.register(fastifyGQL, {
    schema,
    resolvers,
    graphiql: true
  })

  next()
}

registerGraphQL[Symbol.for('skip-override')] = true

export default registerGraphQL
