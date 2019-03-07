module.exports = `
  type User {
    name: String
  }

  type Query {
    users(skip: Int, limit: Int): [User]
    firstUser: User
    hello(name: String): String
  }

  type Mutation {
    createUser(name: String!): User
  }
`
