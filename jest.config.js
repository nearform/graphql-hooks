const commonConfig = {
  testEnvironment: 'jsdom'
}

const projects = [
  {
    ...commonConfig,
    ...{
      displayName: 'graphql-hooks-jsdom',
      roots: ['./packages/graphql-hooks/test-jsdom'],
      setupFiles: ['<rootDir>/packages/graphql-hooks/test-jsdom/setup.js'],
      automock: false
    }
  },
  {
    ...commonConfig,
    ...{
      displayName: 'graphql-hooks-node',
      roots: ['./packages/graphql-hooks/test-node'],
      automock: false,
      testEnvironment: 'node'
    }
  },
  {
    ...commonConfig,
    ...{
      roots: ['./packages/graphql-hooks-memcache'],
      displayName: 'graphql-hooks-memcache'
    }
  },
  {
    ...commonConfig,
    ...{
      roots: ['./packages/graphql-hooks-ssr'],
      displayName: 'graphql-hooks-ssr',
      testEnvironment: 'node'
    }
  },
  {
    ...commonConfig,
    ...{
      roots: ['./examples/create-react-app'],
      coveragePathIgnorePatterns: ['/node_modules/', '<rootDir>/packages/*'],
      transform: {
        '\\.[jt]sx?$': 'babel-jest'
      },
      displayName: 'cra-example',
      testEnvironment: 'jsdom'
    }
  }
]
module.exports = {
  projects
}
