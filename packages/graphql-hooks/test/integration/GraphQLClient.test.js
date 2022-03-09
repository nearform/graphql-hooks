import { GraphQLClient } from '../../src'
import APQMiddleware from '../../src/middlewares/apqMiddleware'
import fetchMock from 'jest-fetch-mock'
import CacheMiddleware from '../../src/middlewares/examples/cacheMiddleware'
import DebugMiddleware from '../../src/middlewares/examples/debugMiddleware'

const TEST_QUERY = /* GraphQL */ `
  query Test($limit: Int) {
    test(limit: $limit) {
      id
    }
  }
`

describe('GraphQLClient', () => {
  describe('usage of multiple middlewares together', () => {
    let client
    const logger = jest.fn()

    beforeEach(() => {
      logger.mockReset()
      fetchMock.mockReset()
      client = new GraphQLClient({
        middleware: [CacheMiddleware(), DebugMiddleware(logger)],
        fetch: fetchMock,
        url: 'localhost:3000/graphql'
      })
    })

    it('caches + logs', async () => {
      const MOCK_DATA = { data: 'data' }
      fetchMock.mockResponseOnce(JSON.stringify(MOCK_DATA))

      await client.request({
        query: TEST_QUERY
      })
      await client.request({
        query: TEST_QUERY
      })
      expect(fetchMock).toHaveBeenCalledTimes(1)
      expect(logger).toHaveBeenCalledTimes(2)
    })
  })

  describe('DebugMiddleware', () => {
    let client
    const logger = jest.fn()

    beforeEach(() => {
      logger.mockReset()
      fetchMock.mockReset()
      client = new GraphQLClient({
        middleware: [DebugMiddleware(logger)],
        fetch: fetchMock,
        url: 'localhost:3000/graphql'
      })
    })

    it('logs request start and end', async () => {
      const MOCK_DATA = { data: 'data' }
      fetchMock.mockResponseOnce(JSON.stringify(MOCK_DATA))

      const res = await client.request({
        query: TEST_QUERY
      })
      expect(res).toEqual(MOCK_DATA)
      expect(fetchMock).toHaveBeenCalledTimes(1)
      expect(logger.mock.calls[0]).toEqual([
        'Start request:',
        {
          query: TEST_QUERY
        }
      ])
      expect(logger.mock.calls[1]).toEqual(['End request:', MOCK_DATA])
    })
  })

  describe('CacheMiddleware', () => {
    let client

    beforeEach(() => {
      fetchMock.mockReset()
      client = new GraphQLClient({
        middleware: [CacheMiddleware()],
        fetch: fetchMock,
        url: 'localhost:3000/graphql'
      })
    })

    it('caches first result', async () => {
      const MOCK_DATA = { data: 'data' }
      fetchMock.mockResponseOnce(() =>
        Promise.resolve(JSON.stringify(MOCK_DATA))
      )

      const res1 = await client.request({
        query: TEST_QUERY
      })
      const res2 = await client.request({
        query: TEST_QUERY
      })
      expect(res1).toEqual(MOCK_DATA)
      expect(res2).toEqual(MOCK_DATA)
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })
  })

  describe('APQMiddleware', () => {
    const MOCK_DATA = { data: [{ id: 1 }, { id: 2 }, { id: 3 }] }
    let client

    beforeEach(() => {
      fetchMock.mockReset()
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
