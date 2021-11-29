const users = [
  {
    name: 'Brian'
  },
  {
    name: 'Jack'
  },
  {
    name: 'Joe'
  }
]

const resolvers = {
  Query: {
    users: (_, { skip = 0, limit }) => {
      const end = limit ? skip + limit : undefined
      return users.slice(skip, end)
    },
    firstUser: () => users[0],
    hello: (_, { name }) => `Hello ${name}`
  },
  Mutation: {
    createUser: (_, user) => {
      users.push(user)
      return user
    }
  }
}

export default resolvers
