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

  describe('multiple asynchronous response hooks', () => {
    let client
    const logger = jest.fn()

    const AsyncMidd =
      (logger, timeout) =>
      ({ addResponseHook }, next) => {
        addResponseHook(async res => {
          await new Promise(resolve => setTimeout(resolve, timeout))
          logger('Timeout:', timeout)
          return res
        })
        next()
      }

    const SyncMidd =
      logger =>
      ({ addResponseHook }, next) => {
        addResponseHook(res => {
          logger('Timeout: none')
          return res
        })
        next()
      }

    beforeEach(() => {
      logger.mockReset()
      fetchMock.mockReset()
      client = new GraphQLClient({
        middleware: [
          AsyncMidd(logger, 20),
          AsyncMidd(logger, 10),
          SyncMidd(logger)
        ],
        fetch: fetchMock,
        url: 'localhost:3000/graphql'
      })
    })

    it('Handles async response hooks in correct order', async () => {
      const MOCK_DATA = { data: 'data' }
      fetchMock.mockResponseOnce(JSON.stringify(MOCK_DATA))

      await client.request({
        query: TEST_QUERY
      })
      expect(logger).toHaveBeenCalledTimes(3)
      expect(logger.mock.calls).toEqual([
        ['Timeout:', 20],
        ['Timeout:', 10],
        ['Timeout: none']
      ])
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
        'localhost:3000/graphql?variables=%7B%22limit%22%3A3%7D&extensions=%7B%22persistedQuery%22%3A%7B%22version%22%3A1%2C%22sha256Hash%22%3A%2226d6478a7140fba74900a0fea5ffe3552d5ee584a4991612250dc5ef8ddf0948%22%7D%7D',
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
        'localhost:3000/graphql?variables=%7B%22limit%22%3A3%7D&extensions=%7B%22persistedQuery%22%3A%7B%22version%22%3A1%2C%22sha256Hash%22%3A%2226d6478a7140fba74900a0fea5ffe3552d5ee584a4991612250dc5ef8ddf0948%22%7D%7D',
        { method: 'GET', headers: {} }
      ])
      expect(fetchMock.mock.calls[1]).toEqual([
        'localhost:3000/graphql',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            query: TEST_QUERY,
            variables: { limit: 3 },
            extensions: {
              persistedQuery: {
                version: 1,
                sha256Hash:
                  '26d6478a7140fba74900a0fea5ffe3552d5ee584a4991612250dc5ef8ddf0948'
              }
            }
          })
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
