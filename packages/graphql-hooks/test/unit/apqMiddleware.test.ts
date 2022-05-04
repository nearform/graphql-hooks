import fetchMock from 'jest-fetch-mock'

import { GraphQLClient } from '../../src'
import { APQMiddleware, sha256 } from '../../src/middlewares/apqMiddleware'

const TEST_QUERY = /* GraphQL */ `
  query Test($limit: Int) {
    test(limit: $limit) {
      id
    }
  }
`

describe('APQMiddleware', () => {
  const MOCK_DATA = { data: [{ id: 1 }, { id: 2 }, { id: 3 }] }
  const MOCK_ERROR_RESP = {
    errors: [
      {
        message: 'PersistedQueryNotFound',
        extensions: {
          code: 'PERSISTED_QUERY_NOT_FOUND',
          exception: {
            stacktrace: ['PersistedQueryNotFoundError: PersistedQueryNotFound']
          }
        }
      }
    ]
  }
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

    fetchMock.mockResponseOnce(() => Promise.resolve(JSON.stringify(MOCK_DATA)))

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
    fetchMock.mockRejectOnce(() =>
      Promise.reject({
        type: 'PERSISTED_QUERY_NOT_FOUND'
      })
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

  it('handle error from server when response is 200 ok but it does not recognize the hash', async () => {
    const client = new GraphQLClient({
      middleware: [APQMiddleware],
      fetch: fetchMock,
      url: 'localhost:3000/graphql'
    })

    // Call with hash only, but respond with graphQlError
    fetchMock.mockResponseOnce(JSON.stringify(MOCK_ERROR_RESP))
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
    fetchMock.mockRejectOnce(() =>
      Promise.reject({
        type: 'PERSISTED_QUERY_NOT_FOUND'
      })
    )

    // Call with query and hash
    fetchMock.mockRejectOnce(() => Promise.reject({ error }))

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

  describe('Hashing function', () => {
    it('hashes SHA256 correctly', async () => {
      const [resA, resB, resC] = await Promise.all([
        sha256('Hello'),
        sha256('123_test'),
        sha256('%$%')
      ])
      // Expected values are hardcoded results verified to be correctly hashed via sha256
      expect(resA).toBe(
        '185f8db32271fe25f561a6fc938b2e264306ec304eda518007d1764826381969'
      )
      expect(resB).toBe(
        'ecb432bf49775c2ba77004563a83f36dcd7eae602a2d1e1c61f08d2c7223568c'
      )
      expect(resC).toBe(
        'e50f41365e77d118b44456c3931e7e46e4e354482ebd4b7ddba1245694939ff1'
      )
    })
  })
})
