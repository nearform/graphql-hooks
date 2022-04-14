const projects = [
  {
    displayName: 'graphql-hooks',
    roots: ['./packages/graphql-hooks'],
    testMatch: ['<rootDir>/packages/graphql-hooks/**/*.test.js'],
    setupFiles: ['<rootDir>/packages/graphql-hooks/test/setup.js'],
    automock: false,
    testEnvironment: 'jsdom'
  },
  {
    roots: ['./packages/graphql-hooks-memcache'],
    displayName: 'graphql-hooks-memcache',
    testMatch: ['<rootDir>/packages/graphql-hooks-memcache/**/*.test.js'],
    testEnvironment: 'jsdom'
  },
  {
    roots: ['./packages/graphql-hooks-ssr'],
    displayName: 'graphql-hooks-ssr',
    testMatch: ['<rootDir>/packages/graphql-hooks-ssr/**/*.test.js'],
    testEnvironment: 'jsdom'
  },
  {
    roots: ['./examples/create-react-app'],
    coveragePathIgnorePatterns: ['/node_modules/', '<rootDir>/packages/*'],
    transform: {
      '\\.jsx?$': 'babel-jest'
    },
    displayName: 'cra-example',
    testMatch: ['<rootDir>/examples/create-react-app/**/*.test.js'],
    testEnvironment: 'jsdom'
  }
]
module.exports = {
  projects
}
