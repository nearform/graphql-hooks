import { ApolloServer, gql } from 'apollo-server'

const typeDefs = gql`
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

const server = new ApolloServer({ typeDefs, resolvers })

server
  .listen({ port: process.env.SERVER_PORT ?? 8000 })
  .then(({ url }: { url: string }) => {
    console.log(`Apollo Server ready at ${url}`)
  })
