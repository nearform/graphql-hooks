import fastify from 'fastify'
import cors from '@fastify/cors'
import mercurius, { IResolvers } from 'mercurius'
import persistedQueries from './queries.json'

const app = fastify({
  logger: {
    prettyPrint: true
  }
})

app.register(cors, {
  origin: 'http://localhost:3000'
})

const schema = `
  type Query {
    add(x: Int!, y: Int!): Int!
  }
`

const resolvers: IResolvers = {
  Query: {
    add: async (_, obj) => {
      const { x, y } = obj
      return x + y
    }
  }
}

app.register(mercurius, {
  schema,
  resolvers,
  persistedQueries,
  graphiql: true
})

async function start() {
  try {
    await app.listen(8000)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
