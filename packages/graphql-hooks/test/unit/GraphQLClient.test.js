import { GraphQLClient } from '../../src'
import { TextEncoder } from 'util'
import fetchMock from 'jest-fetch-mock'
import { FormData, File as FormDataFile } from 'formdata-node'
import { Readable } from 'stream'

// workaround for https://github.com/octet-stream/form-data/issues/50
const { fileFromPathSync } = require('formdata-node/lib/cjs/fileFromPath')

global.TextEncoder = TextEncoder

const validConfig = {
  url: 'https://my.graphql.api'
}

const TEST_QUERY = /* GraphQL */ `
  query Test($limit: Int) {
    test(limit: $limit) {
      id
    }
  }
`

describe('GraphQLClient', () => {
  describe('when instantiated', () => {
    it('throws if no config is provided', () => {
      expect(() => {
        new GraphQLClient()
      }).toThrow('GraphQLClient: config is required as first parameter')
    })
    it('throws if no url (nor subscriptionClient) provided', () => {
      expect(() => {
        new GraphQLClient({})
      }).toThrow('GraphQLClient: config.url is required')
    })

    it('works if no url is provided but fullWsTransport:true and subscriptionClient is provided', () => {
      expect(() => {
        new GraphQLClient({
          fullWsTransport: true,
          subscriptionClient: {}
        })
      }).not.toThrow()
    })

    it('throws if fetch is not a function', () => {
      expect(() => {
        new GraphQLClient({ ...validConfig, fetch: 'fetch!' })
      }).toThrow('GraphQLClient: config.fetch must be a function')
    })

    it('throws if fetch is not present or polyfilled on the client', () => {
      const oldFetch = global.fetch
      try {
        expect(window.document.createElement).toBeTruthy()
        delete global.fetch
        expect(() => {
          new GraphQLClient({
            ...validConfig,
            cache: { get: 'get', set: 'set' }
          })
        }).toThrow(
          'GraphQLClient: fetch must be polyfilled or passed in new GraphQLClient({ fetch })'
        )
      } finally {
        global.fetch = oldFetch
      }
    })

    it('does not bind fetch to graphql client', () => {
      const oldFetch = global.fetch

      try {
        let fetchThis
        global.fetch = async function () {
          fetchThis = this
          return {}
        }

        const client = new GraphQLClient({
          ...validConfig
        })

        client.request({ query: TEST_QUERY })

        expect(fetchThis).toEqual(undefined)
      } finally {
        global.fetch = oldFetch
      }
    })

    it('throws if fetch is not present or polyfilled when ssrMode is true', () => {
      const oldFetch = global.fetch
      try {
        delete global.fetch
        expect(() => {
          new GraphQLClient({
            ...validConfig,
            ssrMode: true,
            cache: { get: 'get', set: 'set' }
          })
        }).toThrow(
          'GraphQLClient: fetch must be polyfilled or passed in new GraphQLClient({ fetch })'
        )
      } finally {
        global.fetch = oldFetch
      }
    })

    it("doesn't require fetch to be polyfilled when ssrMode is false and running on the server", () => {
      const oldFetch = global.fetch
      const oldWindow = global.window
      try {
        delete global.fetch
        expect(global.window.document.createElement).toBeTruthy()
        delete global.window
        const client = new GraphQLClient({
          ...validConfig,
          ssrMode: false
        })
        expect(client.ssrMode).toBe(false)
      } finally {
        global.fetch = oldFetch
        global.window = oldWindow
      }
    })

    it('throws if config.ssrMode is true and no config.cache is provided', () => {
      expect(() => {
        new GraphQLClient({
          ...validConfig,
          ssrMode: true
        })
      }).toThrow('GraphQLClient: config.cache is required when in ssrMode')
    })

    it('assigns config.cache to an instance property', () => {
      const cache = { get: 'get', set: 'set' }
      const client = new GraphQLClient({ ...validConfig, cache })
      expect(client.cache).toBe(cache)
    })

    it('assigns config.headers to an instance property', () => {
      const headers = { 'My-Header': 'hello' }
      const client = new GraphQLClient({ ...validConfig, headers })
      expect(client.headers).toBe(headers)
    })

    it('assigns config.ssrMode to an instance property if config.cache is provided', () => {
      const client = new GraphQLClient({
        ...validConfig,
        ssrMode: true,
        cache: { get: 'get', set: 'set' }
      })
      expect(client.ssrMode).toBe(true)
    })

    it('assigns config.url to an instance property', () => {
      const client = new GraphQLClient({ ...validConfig })
      expect(client.url).toBe(validConfig.url)
    })

    it('assigns config.fetch to an instance property', () => {
      const myFetch = jest.fn()
      const client = new GraphQLClient({ ...validConfig, fetch: myFetch })
      expect(client.fetch).toBe(myFetch)
    })

    it('assigns config.fetchOptions to an instance property', () => {
      const fetchOptions = { fetch: 'options' }
      const client = new GraphQLClient({ ...validConfig, fetchOptions })
      expect(client.fetchOptions).toBe(fetchOptions)
    })

    it('assigns config.logErrors to an instance property', () => {
      const client = new GraphQLClient({ ...validConfig, logErrors: true })
      expect(client.logErrors).toBe(true)
    })

    it('assigns config.onError to an instance property', () => {
      const onError = jest.fn()
      const client = new GraphQLClient({ ...validConfig, onError })
      expect(client.onError).toBe(onError)
    })

    it('assigns config.useGETForQueries to an instance property', () => {
      const client = new GraphQLClient({
        ...validConfig,
        useGETForQueries: true
      })
      expect(client.useGETForQueries).toBe(true)
    })
  })

  describe('setHeader', () => {
    it('sets the key to the value', () => {
      const client = new GraphQLClient({ ...validConfig })
      client.setHeader('My-Header', 'hello')
      expect(client.headers['My-Header']).toBe('hello')
    })
  })

  describe('setHeaders', () => {
    it('replaces all headers', () => {
      const headers = { 'My-Header': 'hello' }
      const client = new GraphQLClient({ ...validConfig })
      client.setHeaders(headers)
      expect(client.headers).toBe(headers)
    })
  })

  describe('removeHeader', () => {
    it('removes the key', () => {
      const headers = { 'My-Header': 'hello' }
      const client = new GraphQLClient({ ...validConfig, headers })
      expect(client.headers['My-Header']).toBe('hello')
      client.removeHeader('My-Header')
      expect(client.headers).not.toHaveProperty('My-Header')
    })
  })

  describe('logErrorResult', () => {
    let errorLogSpy, logSpy, groupCollapsedSpy, groupEndSpy

    beforeEach(() => {
      errorLogSpy = jest.spyOn(global.console, 'error')
      logSpy = jest.spyOn(global.console, 'log')
      groupCollapsedSpy = jest.spyOn(global.console, 'groupCollapsed')
      groupEndSpy = jest.spyOn(global.console, 'groupEnd')
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    it('logs without error', () => {
      const client = new GraphQLClient({ ...validConfig })

      client.logErrorResult({ result: 'result', operation: 'operation' })
      expect(groupCollapsedSpy).toHaveBeenCalledTimes(2)
      expect(errorLogSpy).toHaveBeenCalledWith('GraphQL Hooks Error')
      expect(groupEndSpy).toHaveBeenCalledTimes(2)
    })

    it('logs a fetchError', () => {
      const client = new GraphQLClient({ ...validConfig })

      client.logErrorResult({
        result: { error: { fetchError: 'on no fetch!' } }
      })
      expect(errorLogSpy).toHaveBeenCalledWith('GraphQL Hooks Error')
      expect(groupCollapsedSpy).toHaveBeenCalledTimes(3)
      expect(groupCollapsedSpy).toHaveBeenCalledWith('FETCH ERROR:')
      expect(logSpy).toHaveBeenCalledWith('on no fetch!')
      expect(groupEndSpy).toHaveBeenCalledTimes(3)
    })

    it('logs an httpError', () => {
      const client = new GraphQLClient({ ...validConfig })
      client.logErrorResult({
        result: { error: { httpError: 'on no http!' } }
      })
      expect(errorLogSpy).toHaveBeenCalledWith('GraphQL Hooks Error')
      expect(groupCollapsedSpy).toHaveBeenCalledTimes(3)
      expect(groupCollapsedSpy).toHaveBeenCalledWith('HTTP ERROR:')
      expect(logSpy).toHaveBeenCalledWith('on no http!')
      expect(groupEndSpy).toHaveBeenCalledTimes(3)
    })

    it('logs all graphQLErrors', () => {
      const client = new GraphQLClient({ ...validConfig })
      const graphQLErrors = ['on no GraphQL!', 'oops GraphQL!']
      client.logErrorResult({ result: { error: { graphQLErrors } } })
      expect(errorLogSpy).toHaveBeenCalledWith('GraphQL Hooks Error')
      expect(groupCollapsedSpy).toHaveBeenCalledTimes(3)
      expect(groupCollapsedSpy).toHaveBeenCalledWith('GRAPHQL ERROR:')
      expect(logSpy).toHaveBeenCalledWith('on no GraphQL!')
      expect(logSpy).toHaveBeenCalledWith('oops GraphQL!')
      expect(groupEndSpy).toHaveBeenCalledTimes(3)
    })
  })

  describe('generateResult', () => {
    it('shows as errored if there are graphQL errors', () => {
      const client = new GraphQLClient({ ...validConfig })
      const result = client.generateResult({
        graphQLErrors: ['error 1', 'error 2']
      })
      expect(result.error.graphQLErrors).toEqual(['error 1', 'error 2'])
    })

    it('shows as errored if there is a fetch error', () => {
      const client = new GraphQLClient({ ...validConfig })
      const result = client.generateResult({
        fetchError: 'fetch error'
      })
      expect(result.error.fetchError).toBe('fetch error')
    })

    it('shows as errored if there is an http error', () => {
      const client = new GraphQLClient({ ...validConfig })
      const result = client.generateResult({
        httpError: 'http error'
      })
      expect(result.error.httpError).toBe('http error')
    })

    it('returns the data without an error', () => {
      const client = new GraphQLClient({ ...validConfig })
      const data = {
        data: 'data!'
      }
      const result = client.generateResult(data)
      expect(result).toEqual({
        data: data.data
      })
    })

    it('returns the errors & data', () => {
      const client = new GraphQLClient({ ...validConfig })
      const data = {
        graphQLErrors: ['graphQL error 1', 'graphQL error 2'],
        fetchError: 'fetch error',
        httpError: 'http error',
        data: 'data!'
      }
      const result = client.generateResult(data)
      expect(result).toEqual({
        error: {
          graphQLErrors: data.graphQLErrors,
          fetchError: data.fetchError,
          httpError: data.httpError
        },
        data: data.data
      })
    })
  })

  describe('getCacheKey', () => {
    it('returns a cache key', () => {
      const client = new GraphQLClient({
        ...validConfig,
        fetchOptions: { optionOne: 1 }
      })
      const cacheKey = client.getCacheKey('operation', {
        fetchOptionsOverrides: { optionTwo: 2 }
      })
      expect(cacheKey).toEqual({
        operation: 'operation',
        fetchOptions: { optionOne: 1, optionTwo: 2 }
      })
    })
  })

  describe('getFetchOptions', () => {
    it('sets method to POST by default', () => {
      const client = new GraphQLClient({ ...validConfig })
      const fetchOptions = client.getFetchOptions('operation')
      expect(fetchOptions.method).toBe('POST')
    })

    it('applies the configured headers', () => {
      const headers = { 'My-Header': 'hello' }
      const client = new GraphQLClient({ ...validConfig, headers })
      const fetchOptions = client.getFetchOptions('operation')

      const actual = fetchOptions.headers['My-Header']
      const expected = 'hello'
      expect(actual).toBe(expected)
    })

    it('allows to override configured options', () => {
      const headers = { 'My-Header': 'hello' }
      const client = new GraphQLClient({ ...validConfig, headers })
      const fetchOptions = client.getFetchOptions('operation', {
        headers: { 'My-Header': 'overridden' }
      })

      const actual = fetchOptions.headers['My-Header']
      const expected = 'overridden'
      expect(actual).toBe(expected)
    })

    describe('without files', () => {
      let fetchOptions, operation

      beforeEach(() => {
        const client = new GraphQLClient({ ...validConfig })
        operation = {
          query: TEST_QUERY,
          variables: { limit: 1 },
          operationName: 'test'
        }
        fetchOptions = client.getFetchOptions(operation)
      })

      it('sets body to the JSON encoded provided operation', () => {
        const actual = fetchOptions.body
        const expected = JSON.stringify(operation)
        expect(actual).toBe(expected)
      })

      it('sets Content-Type header to application/json', () => {
        const actual = fetchOptions.headers['Content-Type']
        const expected = 'application/json'
        expect(actual).toBe(expected)
      })
    })

    // See the GraphQL multipart request spec:
    // https://github.com/jaydenseric/graphql-multipart-request-spec
    describe('with files in browser', () => {
      const client = new GraphQLClient(validConfig)

      const file = new File([''], 'test-image.png', {
        lastModified: new Date().valueOf(),
        name: 'test-image.png',
        size: 44320,
        type: 'image/png'
      })

      const operation = { query: '', variables: { a: file } }
      const fetchOptions = client.getFetchOptions(operation)

      it('sets body conforming to the graphql multipart request spec', () => {
        const actual = [...fetchOptions.body]
        const expected = [
          ['operations', '{"query":"","variables":{"a":null}}'],
          ['map', '{"1":["variables.a"]}'],
          ['1', file]
        ]
        expect(fetchOptions.body).toBeInstanceOf(global.FormData)
        expect(actual).toEqual(expected)
      })

      it('does not set Content-Type header', () => {
        expect(fetchOptions.headers).not.toHaveProperty('Content-Type')
      })
    })

    describe('with files in Node JS', () => {
      const originalFormData = global.FormData

      const client = new GraphQLClient({ ...validConfig, FormData })
      const file = fileFromPathSync('test/mocks/sample.txt')

      const operation = { query: '', variables: { a: file } }
      const fetchOptions = client.getFetchOptions(operation)

      beforeAll(() => {
        delete global.FormData
      })

      afterAll(() => {
        global.FormData = originalFormData
      })

      it('sets body conforming to the graphql multipart request spec', () => {
        const actual = fetchOptions.body
        expect(actual).toBeInstanceOf(FormData)
        expect(actual.get('operations')).toBe(
          '{"query":"","variables":{"a":null}}'
        )
        expect(actual.get('map')).toBe('{"1":["variables.a"]}')
        const actualFile = actual.get('1')
        expect(actualFile).toBeInstanceOf(FormDataFile)
        expect(actualFile.name).toBe('sample.txt')
      })

      it('does not set Content-Type header', () => {
        expect(fetchOptions.headers).not.toHaveProperty('Content-Type')
      })

      it('throws if no FormData polyfill provided', () => {
        const client = new GraphQLClient(validConfig)
        const operation = { query: '', variables: { a: new Readable() } }

        expect(() => client.getFetchOptions(operation)).toThrow(
          'GraphQLClient: FormData must be polyfilled or passed in new GraphQLClient({ FormData })'
        )
      })
    })
  })

  describe('request', () => {
    afterEach(() => {
      fetch.resetMocks()
    })

    it('sends the request to the configured url', async () => {
      const client = new GraphQLClient({ ...validConfig })
      fetch.mockResponseOnce(JSON.stringify({ data: 'data' }))
      await client.request({ query: TEST_QUERY })

      const actual = fetch.mock.calls[0][0]
      const expected = validConfig.url
      expect(actual).toBe(expected)
    })

    it('handles & returns fetch errors', async () => {
      const client = new GraphQLClient({ ...validConfig })
      client.logErrorResult = jest.fn()
      const fetchingError = new Error('Oops fetch!')
      fetch.mockRejectOnce(fetchingError)
      const res = await client.request({ query: TEST_QUERY })
      expect(res.error.fetchError).toBe(fetchingError)
    })

    it('handles & returns http errors', async () => {
      const client = new GraphQLClient({ ...validConfig })
      client.logErrorResult = jest.fn()
      fetch.mockResponseOnce('Denied!', {
        status: 403
      })
      const res = await client.request({ query: TEST_QUERY })
      expect(res.error.httpError).toEqual({
        status: 403,
        statusText: 'Forbidden',
        body: 'Denied!'
      })
    })

    describe('if logErrors is present', () => {
      it('calls logErrorResults if logErrors is true', async () => {
        const client = new GraphQLClient({ ...validConfig, logErrors: true })
        client.logErrorResult = jest.fn()

        fetch.mockResponseOnce('Denied!', {
          status: 403
        })

        await client.request({ query: TEST_QUERY })

        expect(client.logErrorResult).toHaveBeenCalled()
      })

      it('skips calling logErrorResults if logErrors is false', async () => {
        const client = new GraphQLClient({ ...validConfig, logErrors: false })
        client.logErrorResult = jest.fn()

        fetch.mockResponseOnce('Denied!', {
          status: 403
        })

        await client.request({ query: TEST_QUERY })

        expect(client.logErrorResult).not.toHaveBeenCalled()
      })
    })

    describe('if onError is present', () => {
      it('calls onError', async () => {
        const onError = jest.fn()

        const client = new GraphQLClient({ ...validConfig, onError })
        client.logErrorResult = jest.fn()
        fetch.mockResponseOnce('Denied!', {
          status: 403
        })

        await client.request({ query: TEST_QUERY })

        expect(onError).toHaveBeenCalledWith({
          operation: {
            query: TEST_QUERY
          },
          result: {
            data: undefined,
            error: {
              fetchError: undefined,
              graphQLErrors: undefined,
              httpError: {
                body: 'Denied!',
                status: 403,
                statusText: 'Forbidden'
              }
            }
          }
        })
      })
    })

    it('returns valid responses', async () => {
      const client = new GraphQLClient({ ...validConfig })
      fetch.mockResponseOnce(JSON.stringify({ data: 'data!' }))
      const res = await client.request({ query: TEST_QUERY })
      expect(res.data).toBe('data!')
      expect(res.error).toBeUndefined()
    })

    it('returns graphql errors', async () => {
      const client = new GraphQLClient({ ...validConfig })
      client.logErrorResult = jest.fn()
      fetch.mockResponseOnce(
        JSON.stringify({ data: 'data!', errors: ['oops!'] })
      )
      const res = await client.request({ query: TEST_QUERY })
      expect(res.error.graphQLErrors).toEqual(['oops!'])
    })

    it('will use a configured fetch implementation', async () => {
      fetchMock.mockResponseOnce(JSON.stringify({ data: 'data' }))
      const client = new GraphQLClient({ ...validConfig, fetch: fetchMock })
      await client.request({ query: TEST_QUERY })
      expect(fetchMock).toHaveBeenCalled()
    })

    it('should append fetchOptionsOverrides to the fetch options', async () => {
      const fetchOptionsOverrides = {
        mode: 'cors',
        referrer: 'example.com'
      }
      fetchMock.mockResponseOnce(JSON.stringify({ data: 'data' }))
      const client = new GraphQLClient({ ...validConfig, fetch: fetchMock })
      await client.request({ query: TEST_QUERY }, { fetchOptionsOverrides })

      const actual = fetchMock.mock.calls[0][1]
      const expected = fetchOptionsOverrides

      expect(actual).toMatchObject(expected)
    })

    it('will use responseReducer option implementation', async () => {
      const data = { some: 'data' },
        status = 200,
        statusText = 'OK',
        headers = {
          'content-type': 'application/json',
          'x-cache-tags': '1234,5678,9000'
        }
      const client = new GraphQLClient({ ...validConfig })
      fetch.mockResponseOnce(JSON.stringify({ data }), {
        status,
        statusText,
        headers
      })
      const { data: _data } = await client.request(
        { query: TEST_QUERY },
        {
          responseReducer: (fetchedData, response) => ({
            ...fetchedData,
            cacheTags: response.headers.get('x-cache-tags'),
            contentType: response.headers.get('content-type'),
            status: response.status,
            statusText: response.statusText
          })
        }
      )
      expect(_data.some).toBe(data.some)
      expect(_data.status).toBe(status)
      expect(_data.statusText).toBe(statusText)
      expect(_data.cacheTags).toEqual(headers['x-cache-tags'])
      expect(_data.contentType).toEqual(headers['content-type'])
    })

    describe('GET Support', () => {
      it('should support client.fetchOptions.method=GET', async () => {
        fetchMock.mockResponseOnce(JSON.stringify({ data: 'data' }))
        const client = new GraphQLClient({
          ...validConfig,
          fetch: fetchMock,
          fetchOptions: {
            method: 'GET'
          }
        })
        await client.request({ query: TEST_QUERY })

        const expectedUrl = `${validConfig.url}?query=${encodeURIComponent(
          TEST_QUERY
        )}`
        const expectedOptions = {
          method: 'GET',
          headers: {}
        }

        expect(fetchMock).toHaveBeenCalledWith(expectedUrl, expectedOptions)
      })

      it('should support options.fetchOptionsOverrides.method=GET', async () => {
        const fetchOptionsOverrides = {
          method: 'GET'
        }
        fetchMock.mockResponseOnce(JSON.stringify({ data: 'data' }))
        const client = new GraphQLClient({ ...validConfig, fetch: fetchMock })
        await client.request({ query: TEST_QUERY }, { fetchOptionsOverrides })

        const expectedUrl = `${validConfig.url}?query=${encodeURIComponent(
          TEST_QUERY
        )}`
        const expectedOptions = {
          method: 'GET',
          headers: {}
        }

        expect(fetchMock).toHaveBeenCalledWith(expectedUrl, expectedOptions)
      })

      it('should support filter out falsy values before creating the querystring', async () => {
        const fetchOptionsOverrides = {
          method: 'GET'
        }
        fetchMock.mockResponseOnce(JSON.stringify({ data: 'data' }))
        const client = new GraphQLClient({ ...validConfig, fetch: fetchMock })
        await client.request(
          { query: TEST_QUERY, operationName: undefined, variables: undefined },
          { fetchOptionsOverrides }
        )

        const expectedUrl = `${validConfig.url}?query=${encodeURIComponent(
          TEST_QUERY
        )}`
        const expectedOptions = {
          method: 'GET',
          headers: {}
        }

        expect(fetchMock).toHaveBeenCalledWith(expectedUrl, expectedOptions)
      })

      it('should JSON.stringify the variables', async () => {
        const fetchOptionsOverrides = {
          method: 'GET'
        }
        const variables = {
          hello: 'world'
        }
        fetchMock.mockResponseOnce(JSON.stringify({ data: 'data' }))
        const client = new GraphQLClient({ ...validConfig, fetch: fetchMock })
        await client.request(
          { query: TEST_QUERY, operationName: undefined, variables },
          { fetchOptionsOverrides }
        )

        const expectedUrl = `${validConfig.url}?query=${encodeURIComponent(
          TEST_QUERY
        )}&variables=${encodeURIComponent(JSON.stringify(variables))}`
        const expectedOptions = {
          method: 'GET',
          headers: {}
        }

        expect(fetchMock).toHaveBeenCalledWith(expectedUrl, expectedOptions)
      })

      it('should append fetchOptionsOverrides to the fetch options', async () => {
        const fetchOptionsOverrides = {
          method: 'GET',
          mode: 'cors',
          referrer: 'example.com'
        }
        fetchMock.mockResponseOnce(JSON.stringify({ data: 'data' }))
        const client = new GraphQLClient({ ...validConfig, fetch: fetchMock })
        await client.request({ query: TEST_QUERY }, { fetchOptionsOverrides })

        const actual = fetchMock.mock.calls[0][1]
        const expected = fetchOptionsOverrides

        expect(actual).toMatchObject(expected)
      })
    })
  })
})
