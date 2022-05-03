import fastify from 'fastify'
import mercurius, { IResolvers } from 'mercurius'
import persistedQueries from './queries.json'

const app = fastify({
  logger: {
    prettyPrint: true
  }
})

const schema = `
  type Query {
    add(x: Int, y: Int): Int
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
  onlyPersisted: true, // will nullify the effect of the option below (graphiql)
  graphiql: true
})

async function start() {
  try {
    await app.listen(3000)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
