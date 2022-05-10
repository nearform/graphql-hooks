const commonConfig = {
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'jsdom',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/config/tsconfig.base.json'
    }
  }
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
      displayName: 'graphql-hooks-ssr'
    }
  },
  {
    ...commonConfig,
    ...{
      roots: ['./examples/create-react-app'],
      coveragePathIgnorePatterns: ['/node_modules/', '<rootDir>/packages/*'],
      transform: {
        '\\.jsx?$': 'babel-jest'
      },
      displayName: 'cra-example',
      testEnvironment: 'jsdom'
    }
  }
]
module.exports = {
  projects
}
