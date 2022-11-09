import fastify from 'fastify'
import mercurius from 'mercurius'
import { join, dirname } from 'path'
import fs from 'fs'
import fastifyStatic from '@fastify/static'
import { LowSync } from 'lowdb'
import { JSONFileSync } from 'lowdb/node'
import mq from 'mqemitter-redis'
import { fileURLToPath } from 'url'
import cors from '@fastify/cors'

const __dirname = dirname(fileURLToPath(import.meta.url))

const emitter = mq({
  port: 6379,
  host: '127.0.0.1'
})

const NUMBER_OF_VOTES = 5
const APP_PORT = parseInt(process.env.APP_PORT || '8000', 10)

const app = fastify()
const indexHtml = fs.readFileSync(join(__dirname, './index.html'), {
  encoding: 'utf8'
})

app.register(fastifyStatic, {
  root: join(__dirname, '../../build/public'),
  prefix: '/public/'
})

const votes = []
for (let i = 1; i <= NUMBER_OF_VOTES; i++) {
  votes.push({ id: i, title: `Vote #${i}`, ayes: 0, noes: 0 })
}
const defaults = { votes }

const adapter = new JSONFileSync('votes.json')
const db = new LowSync(adapter)
await db.read()
db.data = db.data || defaults

app.register(cors, {
  origin: '*'
})

const VOTE_ADDED = 'VOTE_ADDED'

const schema = `
  type Vote {
    id: ID!
    title: String!
    ayes: Int
    noes: Int
  }

  type Query {
    votes: [Vote]
  }

  type Mutation {
    voteAye(voteId: ID!): Vote
    voteNo(voteId: ID!): Vote
  }

  type Subscription {
    voteAdded(voteId: ID!): Vote
  }
`

const resolvers = {
  Query: {
    votes: async () => db.data.votes
  },
  Mutation: {
    voteAye: async (_, { voteId }, { pubsub }) => {
      const vote = db.data.votes[voteId - 1]

      if (vote) {
        const v = { ...vote }
        v.ayes++
        db.data.votes[voteId - 1] = v
        await db.write()
        await pubsub.publish({
          topic: `${VOTE_ADDED}_${voteId}`,
          payload: {
            voteAdded: v
          }
        })

        return v
      }

      throw new Error('Invalid vote id')
    },
    voteNo: async (_, { voteId }, { pubsub }) => {
      const vote = db.data.votes[voteId - 1]

      if (vote) {
        const v = { ...vote }
        v.noes++
        db.data.votes[voteId - 1] = v
        await db.write()

        await pubsub.publish({
          topic: `VOTE_ADDED_${voteId}`,
          payload: {
            voteAdded: v
          }
        })
        return v
      }

      throw new Error('Invalid vote id')
    }
  },
  Subscription: {
    voteAdded: {
      subscribe: async (root, args, context) => {
        const { pubsub } = context
        return await pubsub.subscribe(`VOTE_ADDED_${args.voteId}`)
      }
    }
  }
}

app.register(mercurius, {
  schema,
  resolvers,
  subscription: {
    emitter
  }
})

app.get('/', async function (req, reply) {
  reply.header('Content-Type', 'text/html').send(indexHtml)
})

app.listen({ port: APP_PORT })
