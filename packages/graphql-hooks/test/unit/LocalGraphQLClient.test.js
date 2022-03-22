import { LocalGraphQLClient } from '../../src'
import LocalGraphQLError from '../../src/LocalGraphQLError'

const QUERY_VARIABLES = {
  query: 'AddNumbersQuery',
  variables: {
    a: 2,
    b: 3
  }
}

const QUERY_BASIC = {
  query: 'HelloQuery'
}

const QUERY_ERRORS = {
  query: 'ErrorQuery'
}

const localQueries = {
  AddNumbersQuery: ({ a, b }) => ({
    addedNumber: a + b
  }),
  HelloQuery: () => ({
    hello: 'Hello world'
  }),
  ErrorQuery: () =>
    new LocalGraphQLError({
      httpError: {
        status: 404,
        statusText: 'Not found',
        body: 'Not found'
      }
    })
}

describe('LocalGraphQLClient', () => {
  it('handles requests and returns localQuery data', async () => {
    const client = new LocalGraphQLClient({ localQueries })
    const result = await client.request(QUERY_BASIC)
    expect(result.data.hello).toBe('Hello world')
  })
  it('handles requests with variables', async () => {
    const client = new LocalGraphQLClient({ localQueries })
    const result = await client.request(QUERY_VARIABLES)
    expect(result.data).toBeDefined()
    expect(result.data.addedNumber).toBe(5)
  })
  it('handles error mocking', async () => {
    const client = new LocalGraphQLClient({ localQueries })
    const result = await client.request(QUERY_ERRORS)
    expect(result.error).toBeDefined()
    expect(result.error.httpError.status).toBe(404)
  })
})
