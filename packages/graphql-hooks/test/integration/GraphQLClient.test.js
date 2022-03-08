import { GraphQLClient } from '../../src'
import APQMiddleware from '../../src/middlewares/apqMiddleware'
import fetchMock from 'jest-fetch-mock'

const TEST_QUERY = /* GraphQL */ `
  query Test($limit: Int) {
    test(limit: $limit) {
      id
    }
  }
`

describe('GraphQLClient', () => {
  describe('APQMiddleware', () => {
    const MOCK_DATA = { data: [{ id: 1 }, { id: 2 }, { id: 3 }] }
    let client

    beforeEach(() => {
      fetchMock.mockClear()
      client = new GraphQLClient({
        middleware: [APQMiddleware],
        fetch: fetchMock,
        url: 'localhost:3000/graphql'
      })
    })

    it('returns data if API recognizes the hash', async () => {
      const client = new GraphQLClient({
        middleware: [APQMiddleware],
        fetch: fetchMock,
        url: 'localhost:3000/graphql'
      })

      fetchMock.mockResponseOnce(() =>
        Promise.resolve(JSON.stringify(MOCK_DATA))
      )

      const res = await client.request({
        query: TEST_QUERY,
        variables: { limit: 3 }
      })

      expect(res).toEqual(MOCK_DATA)
      expect(fetchMock).toHaveBeenCalledWith(
        'localhost:3000/graphql?variables=%7B%22limit%22%3A3%7D&extensions={"persistedQuery":{"version":1,"sha256Hash":"10323211"}}',
        { headers: {}, method: 'GET' }
      )
    })

    it('calls API again with both query and hash if server does not recognize the hash', async () => {
      const client = new GraphQLClient({
        middleware: [APQMiddleware],
        fetch: fetchMock,
        url: 'localhost:3000/graphql'
      })

      // Call with hash only
      fetchMock.mockRejectOnce(
        JSON.stringify({ type: 'PERSISTED_QUERY_NOT_FOUND' })
      )
      // Call with query and hash
      fetchMock.mockResponseOnce(JSON.stringify(MOCK_DATA))

      const res = await client.request({
        query: TEST_QUERY,
        variables: { limit: 3 }
      })

      expect(res).toEqual(MOCK_DATA)
      expect(fetchMock.mock.calls[0]).toEqual([
        'localhost:3000/graphql?variables=%7B%22limit%22%3A3%7D&extensions={"persistedQuery":{"version":1,"sha256Hash":"10323211"}}',
        { method: 'GET', headers: {} }
      ])
      expect(fetchMock.mock.calls[1]).toEqual([
        'localhost:3000/graphql',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: '{"query":"\\n  query Test($limit: Int) {\\n    test(limit: $limit) {\\n      id\\n    }\\n  }\\n","variables":{"limit":3}}'
        }
      ])
    })

    it('returns error if even the second API request fails', async () => {
      const error = 'Failed'
      // Call with hash only
      fetchMock.mockRejectOnce(
        JSON.stringify({ type: 'PERSISTED_QUERY_NOT_FOUND' })
      )
      // Call with query and hash
      fetchMock.mockRejectOnce({ error })

      expect(
        client.request({
          query: TEST_QUERY,
          variables: { limit: 3 }
        })
      ).resolves.toEqual({
        data: undefined,
        error: {
          fetchError: { error },
          graphQLErrors: undefined,
          httpError: undefined
        }
      })
    })
  })
})
