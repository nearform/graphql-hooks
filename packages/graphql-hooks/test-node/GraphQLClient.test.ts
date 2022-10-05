import path from 'path'
import { GraphQLClient } from '../src'
import { FormData, File } from 'formdata-node'
import { fileFromPathSync } from 'formdata-node/file-from-path'
import { Events } from '../src/events'
import EventEmitter from 'events'
import { Operation } from '../lib/types/common-types'

const validConfig = {
  url: 'https://my.graphql.api'
}

const validQuery = `
  query {
    someQuery {
      someProperty
    }
  }
`

describe('with files in Node JS', () => {
  const originalFormData = global.FormData

  const client = new GraphQLClient({ ...validConfig, FormData })
  const file = fileFromPathSync(path.resolve(__dirname, './sample.txt'))

  const operation = { query: '', variables: { a: file } }
  const fetchOptions = client.getFetchOptions(operation)

  beforeAll(() => {
    //@ts-ignore
    delete global.FormData
  })

  afterAll(() => {
    global.FormData = originalFormData
  })

  it('sets body conforming to the graphql multipart request spec', () => {
    const actual = fetchOptions.body as FormData

    expect(actual).toBeInstanceOf(FormData)
    expect(actual.get('operations')).toBe('{"query":"","variables":{"a":null}}')
    expect(actual.get('map')).toBe('{"1":["variables.a"]}')
    const actualFile = actual.get('1') as unknown as File
    expect(actualFile).toBeInstanceOf(File)
    expect(actualFile.name).toBe('sample.txt')
  })

  it('does not set Content-Type header', () => {
    expect(fetchOptions.headers).not.toHaveProperty('Content-Type')
  })

  it('throws if no FormData polyfill provided', () => {
    const client = new GraphQLClient(validConfig)
    const operation = { query: '', variables: { a: file } }

    expect(() => client.getFetchOptions(operation)).toThrow(
      'GraphQLClient: FormData must be polyfilled or passed in new GraphQLClient({ FormData })'
    )
  })

  it('should call every dependency of the invalidateQuery function', () => {
    const client = new GraphQLClient(validConfig)
    const mutationsEmitterMock = {
      ...new EventEmitter(),
      emit: jest.fn()
    }
    const cacheMock = {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
      clear: jest.fn(),
      keys: jest.fn(),
      getInitialState: jest.fn()
    }
    const getCacheKeyMock = jest.fn(query => query)
    const resultMock = { hello: 'World' }

    client.getCacheKey = getCacheKeyMock
    client.cache = cacheMock
    client.request = jest.fn(() => ({
      then: jest.fn(callback => {
        callback(resultMock)
        return {
          catch: jest.fn()
        }
      })
    })) as any
    client.mutationsEmitter = mutationsEmitterMock

    client.invalidateQuery(validQuery)

    expect(getCacheKeyMock).toBeCalledTimes(1)
    expect(getCacheKeyMock).toBeCalledWith({ query: validQuery })

    expect(cacheMock.delete).toBeCalledTimes(1)
    expect(cacheMock.delete).toBeCalledWith({ query: validQuery })

    expect(mutationsEmitterMock.emit).toBeCalledTimes(1)
    expect(mutationsEmitterMock.emit).toBeCalledWith(
      Events.DATA_INVALIDATED,
      resultMock
    )
  })

  it('should not call any dependency of the invalidateQuery when there is no cache', () => {
    const client = new GraphQLClient(validConfig)
    const requestMock = jest.fn()

    client.request = requestMock
    client.cache = undefined

    client.invalidateQuery(validQuery)

    expect(requestMock).not.toBeCalled()
  })

  it('correctly uses the invalidateQuery function when using an Operation object', () => {
    const operation = {
      query: validQuery,
      operationName: 'Operation'
    }
    
    const client = new GraphQLClient(validConfig)
    const mutationsEmitterMock = {
      ...new EventEmitter(),
      emit: jest.fn()
    }
    const cacheMock = {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
      clear: jest.fn(),
      keys: jest.fn(),
      getInitialState: jest.fn()
    }
    const getCacheKeyMock = jest.fn(query => query)
    const resultMock = { hello: 'World' }

    client.getCacheKey = getCacheKeyMock
    client.cache = cacheMock
    client.request = jest.fn(() => ({
      then: jest.fn(callback => {
        callback(resultMock)
        return {
          catch: jest.fn()
        }
      })
    })) as any
    client.mutationsEmitter = mutationsEmitterMock

    client.invalidateQuery(operation)

    expect(getCacheKeyMock).toBeCalledTimes(1)
    expect(getCacheKeyMock).toBeCalledWith(operation)

    expect(cacheMock.delete).toBeCalledTimes(1)
    expect(cacheMock.delete).toBeCalledWith(operation)

    expect(mutationsEmitterMock.emit).toBeCalledTimes(1)
    expect(mutationsEmitterMock.emit).toBeCalledWith(
      Events.DATA_INVALIDATED,
      resultMock
    )
  })

  it('should call invalidateQuery function with variables property set on the Operations object', () => {
    const file = fileFromPathSync(path.resolve(__dirname, './sample.txt'))

    const operation = {
      operationName: 'Operation',
      variables: {
        a: file,
        b: 123,
        c: 'test',
        d: true
      },
      query: validQuery
    }

    const client = new GraphQLClient(validConfig)
    const mutationsEmitterMock = {
      ...new EventEmitter(),
      emit: jest.fn()
    }
    const cacheMock = {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
      clear: jest.fn(),
      keys: jest.fn(),
      getInitialState: jest.fn()
    }
    const getCacheKeyMock = jest.fn(query => query)
    const resultMock = { hello: 'World' }

    client.getCacheKey = getCacheKeyMock
    client.cache = cacheMock
    client.request = jest.fn(() => ({
      then: jest.fn(callback => {
        callback(resultMock)
        return {
          catch: jest.fn()
        }
      })
    })) as any
    client.mutationsEmitter = mutationsEmitterMock

    client.invalidateQuery(operation)

    expect(getCacheKeyMock).toBeCalledTimes(1)
    expect(getCacheKeyMock).toBeCalledWith(operation)

    expect(cacheMock.delete).toBeCalledTimes(1)
    expect(cacheMock.delete).toBeCalledWith(operation)

    expect(mutationsEmitterMock.emit).toBeCalledTimes(1)
    expect(mutationsEmitterMock.emit).toBeCalledWith(
      Events.DATA_INVALIDATED,
      resultMock
    )
  })

  it('should call every dependency of the setQueryData function', () => {
    const client = new GraphQLClient(validConfig)
    const stateMock = { hello: 'World' }
    const olderStatateMock = { data: stateMock }
    const mutationsEmitterMock = {
      ...new EventEmitter(),
      emit: jest.fn()
    }
    const cacheMock = {
      get: jest.fn(() => olderStatateMock),
      set: jest.fn(),
      delete: jest.fn(),
      clear: jest.fn(),
      keys: jest.fn(),
      getInitialState: jest.fn()
    }
    const getCacheKeyMock = jest.fn(query => query)
    const resultMock = { hello: 'World' }
    const updaterMock = jest.fn(() => resultMock)

    client.getCacheKey = getCacheKeyMock
    client.cache = cacheMock
    client.mutationsEmitter = mutationsEmitterMock

    client.setQueryData(validQuery, updaterMock)

    expect(getCacheKeyMock).toBeCalledTimes(1)
    expect(getCacheKeyMock).toBeCalledWith({ query: validQuery })

    expect(cacheMock.get).toBeCalledTimes(1)
    expect(cacheMock.get).toBeCalledWith({ query: validQuery })

    expect(updaterMock).toBeCalledTimes(1)
    expect(updaterMock).toBeCalledWith(resultMock)

    expect(mutationsEmitterMock.emit).toBeCalledTimes(1)
    expect(mutationsEmitterMock.emit).toBeCalledWith(Events.DATA_UPDATED, {
      data: resultMock
    })
  })

  it('should not call any dependency of the setQueryData when there is no cache', () => {
    const client = new GraphQLClient(validConfig)
    const updaterMock = jest.fn()

    client.cache = undefined

    client.setQueryData(validQuery, updaterMock)

    expect(updaterMock).not.toBeCalled()
  })

  it('correctly sets the query data when operationName changes (using Operation object)', () => {
    let operation = {
      query: validQuery,
      operationName: 'Operation1'
    }

    const client = new GraphQLClient(validConfig)
    const stateMock = { hello: 'World' }
    const olderStatateMock = { data: stateMock }
    const mutationsEmitterMock = {
      ...new EventEmitter(),
      emit: jest.fn()
    }
    const cacheMock = {
      get: jest.fn(() => olderStatateMock),
      set: jest.fn(),
      delete: jest.fn(),
      clear: jest.fn(),
      keys: jest.fn(),
      getInitialState: jest.fn()
    }
    const getCacheKeyMock = jest.fn(query => query)
    const resultMock = { hello: 'World' }
    const updaterMock = jest.fn(() => resultMock)

    client.getCacheKey = getCacheKeyMock
    client.cache = cacheMock
    client.mutationsEmitter = mutationsEmitterMock

    client.setQueryData(operation, updaterMock)
    expect(getCacheKeyMock).toBeCalledTimes(1)
    expect(getCacheKeyMock).toBeCalledWith(operation)

    operation.operationName = 'Operation2'

    client.setQueryData(operation, updaterMock)

    expect(getCacheKeyMock).toBeCalledTimes(2)
    expect(getCacheKeyMock).toBeCalledWith(operation)

    expect(cacheMock.get).toBeCalledTimes(2)
    expect(cacheMock.get).toBeCalledWith(operation)

    expect(updaterMock).toBeCalledTimes(2)
    expect(updaterMock).toBeCalledWith(resultMock)

    expect(mutationsEmitterMock.emit).toBeCalledTimes(2)
    expect(mutationsEmitterMock.emit).toBeCalledWith(Events.DATA_UPDATED, {
      data: resultMock
    })
  })

  it('should call setQueryData function with variables property set on the Operations object', () => {
    const file = fileFromPathSync(path.resolve(__dirname, './sample.txt'))

    const operation = {
      operationName: 'Operation',
      variables: {
        a: file,
        b: 123,
        c: 'test',
        d: true
      },
      query: validQuery
    }

    const client = new GraphQLClient(validConfig)
    const stateMock = { hello: 'World' }
    const olderStatateMock = { data: stateMock }
    const mutationsEmitterMock = {
      ...new EventEmitter(),
      emit: jest.fn()
    }
    const cacheMock = {
      get: jest.fn(() => olderStatateMock),
      set: jest.fn(),
      delete: jest.fn(),
      clear: jest.fn(),
      keys: jest.fn(),
      getInitialState: jest.fn()
    }
    const getCacheKeyMock = jest.fn(query => query)
    const resultMock = { hello: 'World' }
    const updaterMock = jest.fn(() => resultMock)

    client.getCacheKey = getCacheKeyMock
    client.cache = cacheMock
    client.mutationsEmitter = mutationsEmitterMock

    client.setQueryData(operation, updaterMock)

    expect(getCacheKeyMock).toBeCalledTimes(1)
    expect(getCacheKeyMock).toBeCalledWith(operation)

    expect(cacheMock.get).toBeCalledTimes(1)
    expect(cacheMock.get).toBeCalledWith(operation)

    expect(updaterMock).toBeCalledTimes(1)
    expect(updaterMock).toBeCalledWith(resultMock)

    expect(mutationsEmitterMock.emit).toBeCalledTimes(1)
    expect(mutationsEmitterMock.emit).toBeCalledWith(Events.DATA_UPDATED, {
      data: resultMock
    })
  })
})
