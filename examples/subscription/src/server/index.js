const fastify = require('fastify')
const GQL = require('fastify-gql')
const path = require('path')
const fs = require('fs')
const fastifyStatic = require('fastify-static')
const lowdb = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const mq = require('mqemitter-redis')
const emitter = mq({
  port: 6379,
  host: '127.0.0.1'
})

const NUMBER_OF_VOTES = 5
const APP_PORT = parseInt(process.env.APP_PORT || '8000', 10)

const app = fastify()
const indexHtml = fs.readFileSync(path.join(__dirname, './index.html'), {
  encoding: 'utf8'
})

app.register(fastifyStatic, {
  root: path.join(__dirname, '../../build/public'),
  prefix: '/public/'
})

const votes = []
for (let i = 1; i <= NUMBER_OF_VOTES; i++) {
  votes.push({ id: i, title: `Vote #${i}`, ayes: 0, noes: 0 })
}
const defaults = { votes }

const adapter = new FileSync('votes.json', {
  defaultValue: defaults
})
const db = lowdb(adapter)

app.register(require('fastify-cors'), {
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
    votes: async () => db.get('votes').value()
  },
  Mutation: {
    voteAye: async (_, { voteId }, { pubsub }) => {
      const vote = db.get(`votes[${voteId - 1}]`)

      if (vote) {
        const v = vote.value()

        v.ayes++
        vote.assign(v).write()
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
      const vote = db.get(`votes[${voteId - 1}]`)
      if (vote) {
        const v = vote.value()

        v.noes++
        vote.assign(v).write()

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

app.register(GQL, {
  schema,
  resolvers,
  subscription: {
    emitter
  }
})

app.get('/', async function(req, reply) {
  reply.header('Content-Type', 'text/html').send(indexHtml)
})

app.listen(APP_PORT)
