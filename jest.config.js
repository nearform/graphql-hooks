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
      testMatch: ['<rootDir>/packages/graphql-hooks/**/*.test.*'],
      setupFiles: ['<rootDir>/packages/graphql-hooks/test/setup.js'],
      automock: false
    }
  },
  {
    ...commonConfig,
    ...{
      roots: ['./packages/graphql-hooks-memcache'],
      displayName: 'graphql-hooks-memcache',
      testMatch: ['<rootDir>/packages/graphql-hooks-memcache/**/*.test.ts']
    }
  },
  {
    ...commonConfig,
    ...{
      roots: ['./packages/graphql-hooks-ssr'],
      displayName: 'graphql-hooks-ssr',
      testMatch: ['<rootDir>/packages/graphql-hooks-ssr/**/*.test.*']
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
      testMatch: ['<rootDir>/examples/create-react-app/**/*.test.ts(x)'],
      testEnvironment: 'jsdom'
    }
  }
]
module.exports = {
  projects
}
