const Fastify = require('fastify')
import mercurius from 'mercurius'
const persistedQueries = require('./gql-queries.json')

const app = Fastify()

const schema = `
  type Query {
    add(x: Int, y: Int): Int
  }
`

const resolvers = {
  Query: {
    add: async (_, { x, y }) => x + y
  }
}

app.register(require('@fastify/cors'))

app.register(mercurius, {
  schema,
  resolvers,
  persistedQueries
})

app.listen(5000)
