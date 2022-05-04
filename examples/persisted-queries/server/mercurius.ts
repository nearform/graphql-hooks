import fastify from 'fastify'
import cors from '@fastify/cors'
import mercurius from 'mercurius'

const app = fastify({
  logger: {
    prettyPrint: true
  }
})

const schema = `
  type Query {
  add(x: Int!, y: Int!): Int!
  }
`

const resolvers = {
  Query: {
    add: async (_: unknown, obj: { x: number; y: number }) => {
      const { x, y } = obj
      return x + y
    }
  }
}

app.register(cors, {
  origin: `http://localhost:${process.env.CLIENT_PORT ?? 3002}`
})

app.register(mercurius, {
  schema,
  resolvers,
  persistedQueryProvider: mercurius.persistedQueryDefaults.automatic(),
  graphiql: true
})

async function start() {
  try {
    await app.listen(process.env.SERVER_PORT ?? 8000)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
