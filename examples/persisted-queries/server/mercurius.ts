import fastify from 'fastify'
import cors from '@fastify/cors'
import mercurius from 'mercurius'

const app = fastify({
  logger: true
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
  origin: `http://localhost:${process.env.PORT ?? 3000}`
})

app.register(mercurius, {
  schema,
  resolvers,
  persistedQueryProvider: mercurius.persistedQueryDefaults.automatic(),
  graphiql: true
})

async function start() {
  try {
    return app.listen({
      port: parseInt(process.env.SERVER_PORT || '8080', 10)
    })
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
