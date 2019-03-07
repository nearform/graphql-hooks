const fastifyGQL = require('fastify-gql')

const schema = require('./schema')
const resolvers = require('./resolvers')

function registerGraphQL(fastify, opts, next) {
  fastify.register(fastifyGQL, {
    schema,
    resolvers,
    graphiql: true
  })

  next()
}

registerGraphQL[Symbol.for('skip-override')] = true

module.exports = registerGraphQL
