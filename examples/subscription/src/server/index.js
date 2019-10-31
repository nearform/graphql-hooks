const fastify = require('fastify')
const GQL = require('fastify-gql')
const mq = require('mqemitter')
const emitter = mq()
const path = require('path')
const fs = require('fs')
const fastifyStatic = require('fastify-static')

const NUMBER_OF_VOTES = 5

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
    votes: async () => votes
  },
  Mutation: {
    voteAye: async (_, { voteId }, { pubsub }) => {
      if (voteId <= votes.length) {
        votes[voteId - 1].ayes++
        await pubsub.publish({
          topic: `${VOTE_ADDED}_${voteId}`,
          payload: {
            voteAdded: votes[voteId - 1]
          }
        })
        return votes[voteId - 1]
      }

      throw new Error('Invalid vote id')
    },
    voteNo: async (_, { voteId }, { pubsub }) => {
      if (voteId <= votes.length) {
        votes[voteId - 1].noes++

        let payload = votes[voteId - 1]
        await pubsub.publish({
          topic: `VOTE_ADDED_${voteId}`,
          payload: {
            voteAdded: payload
          }
        })
        return votes[voteId - 1]
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

app.listen(8000)
