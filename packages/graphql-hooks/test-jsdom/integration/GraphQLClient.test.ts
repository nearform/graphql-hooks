import { GraphQLClient } from '../../src'
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
    let client: GraphQLClient
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
    let client: GraphQLClient
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
    let client: GraphQLClient
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
    let client: GraphQLClient

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
})
