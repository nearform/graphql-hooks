import { ApolloServer, gql } from 'apollo-server'

const typeDefs = gql`
  type Query {
    add(x: Int!, y: Int!): Int!
  }
`

const resolvers = {
  Query: {
    add: async (_: any, obj: any) => {
      const { x, y } = obj
      return x + y
    }
  }
}

async function start() {
  const server = new ApolloServer({ typeDefs, resolvers })

  server.listen(8000).then(({ url }: { url: string }) => {
    console.log(`Server ready at ${url}`)
  })
}

start()
