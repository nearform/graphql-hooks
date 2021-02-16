import { GraphQLClient } from '../../src'

const validConfig = {
  url: 'https://my.graphql.api'
}

beforeAll(() => {
  delete global.fetch
})

describe('GraphQLClient', () => {
  it("doesn't require fetch to be polyfilled when ssrMode is false", () => {
    expect(global.fetch).toBe(undefined)
    const client = new GraphQLClient({
      ...validConfig,
      ssrMode: false,
      cache: { get: 'get', set: 'set' }
    })
    expect(client.ssrMode).toBe(false)
  })
})
