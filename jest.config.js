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
      displayName: 'graphql-hooks',
      roots: ['./packages/graphql-hooks'],
      setupFiles: ['<rootDir>/packages/graphql-hooks/test/setup.js'],
      automock: false
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
