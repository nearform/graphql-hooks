import T from 'prop-types'
import React from 'react'
import { render, screen } from '@testing-library/react'
import memCache from 'graphql-hooks-memcache'
import { Client, getInitialState } from 'graphql-hooks-ssr'
import { GraphQLClient, ClientContext, useQuery } from '../../src'
import { createMockResponse } from '../utils'

let testComponentRenderCount = 0

/* eslint-disable react/display-name, react/prop-types */
const getWrapper =
  (client: GraphQLClient) =>
  ({ children }) =>
    <ClientContext.Provider value={client}>{children}</ClientContext.Provider>
/* eslint-enable react/display-name, react/prop-types */

const TestComponent = ({ query = '{ hello }', options }) => {
  testComponentRenderCount++
  const { loading, error, data } = useQuery(query, options)

  return (
    <div>
      {loading && <div data-testid="loading">Loading...</div>}
      {error && <div data-testid="error">Error</div>}
      {data && <div data-testid="data">{data}</div>}
    </div>
  )
}
TestComponent.propTypes = {
  options: T.object,
  query: T.string
}

describe('useQuery Integrations', () => {
  // reused variables
  let client
  let wrapper

  beforeEach(() => {
    testComponentRenderCount = 0
    client = new GraphQLClient({ url: '/graphql' })
    client.request = jest.fn().mockResolvedValue({ data: 'data v1' })
    wrapper = getWrapper(client)
  })

  it('should reset data if the query changes', async () => {
    let dataNode: HTMLElement

    const { rerender, getByTestId } = render(
      <TestComponent query={'{ hello }'} />,
      {
        wrapper
      }
    )

    // first render
    // loading -> data
    expect(getByTestId('loading')).toBeTruthy()
    dataNode = await screen.findByTestId('data')
    expect(dataNode.textContent).toBe('data v1')
    expect(() => getByTestId('loading')).toThrow()

    // second render
    // new query, the data should be null from previous query
    client.request.mockResolvedValueOnce({ data: 'data v2' })
    rerender(<TestComponent query={'{ goodbye }'} />)

    expect(getByTestId('loading')).toBeTruthy()
    expect(() => getByTestId('data')).toThrow()
    dataNode = await screen.findByTestId('data')
    expect(dataNode.textContent).toBe('data v2')
    expect(() => getByTestId('loading')).toThrow()

    // 1. loading
    // 2. data v1
    // 3. explict rerender call
    // 4. loading again
    // 5. data v2
    expect(testComponentRenderCount).toBe(6)
  })

  it('should reset state when options.variables change', async () => {
    let dataNode: HTMLElement
    let options = { variables: { a: 'a' } }

    const { rerender, getByTestId } = render(
      <TestComponent options={options} />,
      {
        wrapper
      }
    )

    // first render
    // loading -> data
    expect(getByTestId('loading')).toBeTruthy()
    dataNode = await screen.findByTestId('data')
    expect(dataNode.textContent).toBe('data v1')
    expect(() => getByTestId('loading')).toThrow()

    // second render
    // new variables, the data should be null from previous query
    client.request.mockResolvedValueOnce({ data: 'data v2' })
    options = { variables: { a: 'b' } }

    rerender(<TestComponent options={options} />)

    expect(getByTestId('loading')).toBeTruthy()
    expect(() => getByTestId('data')).toThrow()
    dataNode = await screen.findByTestId('data')
    expect(dataNode.textContent).toBe('data v2')
    expect(() => getByTestId('loading')).toThrow()

    // 1. loading
    // 2. data v1
    // 3. explict rerender call
    // 4. loading again
    // 5. data v2
    expect(testComponentRenderCount).toBe(6)
  })

  it('should not rerender after a SSR', () => {
    const query = 'query { hiya }'
    const client = new GraphQLClient({
      url: '/graphql',
      cache: {
        get: () => ({
          error: false,
          data: 'hello',
          cacheKey: client.getCacheKey({
            query
          })
        }),
        set: () => {},
        delete: () => {},
        clear: () => {},
        keys: () => {},
        getInitialState: () => ({})
      }
    })

    wrapper = getWrapper(client)

    const { getByTestId } = render(<TestComponent query={query} />, {
      wrapper
    })

    expect(() => getByTestId('loading')).toThrow()
    expect(getByTestId('data').textContent).toBe('hello')
    expect(testComponentRenderCount).toBe(2)
  })
})

describe('Server side rendering', () => {
  it('should cache SSR queries', async () => {
    const mockData = {
      data: {
        users: [
          {
            name: 'Brian'
          }
        ]
      }
    }
    const mockQuery = 'query { stuff }'
    const fakeResponse = createMockResponse({
      ok: true,
      json: () => Promise.resolve(mockData)
    })

    const client = new GraphQLClient({
      url: '/graphql',
      logErrors: true,
      cache: memCache(),
      fetch: () => Promise.resolve(fakeResponse)
    })

    // mock cache to get the expected result
    const mockCache = memCache()
    mockCache.set(
      client.getCacheKey({
        query: mockQuery
      }),
      mockData
    )

    const Component = () => {
      // we just need to call the hook
      useQuery(mockQuery)
      return <div>hello</div>
    }

    const App = (
      <ClientContext.Provider value={client}>
        <Component />
      </ClientContext.Provider>
    )

    const actual = await getInitialState({
      App,
      client: client as Client
    })
    const expected = mockCache.getInitialState()

    expect(actual).toEqual(expected)
  })

  it('should cache dependant SSR queries', async () => {
    const mockData = {
      data: {
        users: [
          {
            name: 'Brian'
          }
        ]
      }
    }
    const mockQuery = (id: number) => `query GetStuff${id}{ stuff() }`
    const fakeResponse = createMockResponse({
      ok: true,
      json: () => Promise.resolve(mockData)
    })

    const client = new GraphQLClient({
      url: '/graphql',
      logErrors: true,
      cache: memCache(),
      fetch: () => Promise.resolve(fakeResponse)
    })

    const Component1 = () => {
      const { loading } = useQuery(mockQuery(1))

      if (loading) {
        return <div>loading...</div>
      }

      return <Component2 />
    }

    const Component2 = () => {
      const { loading } = useQuery(mockQuery(2))

      if (loading) {
        return <div>loading...</div>
      }

      return <Component3 />
    }

    const Component3 = () => {
      const { loading } = useQuery(mockQuery(3))

      if (loading) {
        return <div>loading...</div>
      }

      return <div>hello</div>
    }

    const App = (
      <ClientContext.Provider value={client}>
        <Component1 />
      </ClientContext.Provider>
    )

    const actual = await getInitialState({
      App,
      client: client as Client
    })

    // mock cache to get the expected result
    const mockCache = memCache()
    mockCache.set(
      client.getCacheKey({
        query: mockQuery(1)
      }),
      mockData
    )

    mockCache.set(
      client.getCacheKey({
        query: mockQuery(2)
      }),
      mockData
    )

    mockCache.set(
      client.getCacheKey({
        query: mockQuery(3)
      }),
      mockData
    )

    const expected = mockCache.getInitialState()
    expect(actual).toEqual(expected)
  })

  it('should skip queries when skipCache=true', async () => {
    const mockQuery = 'query { stuff }'
    const fetchMock = jest.fn().mockResolvedValue({
      data: {
        users: [
          {
            name: 'Brian'
          }
        ]
      }
    })

    const client = new GraphQLClient({
      url: '/graphql',
      logErrors: true,
      cache: memCache(),
      fetch: fetchMock
    })

    const Component = () => {
      // we just need to call the hook
      useQuery(mockQuery, { skipCache: true })
      return <div>hello</div>
    }

    const App = (
      <ClientContext.Provider value={client}>
        <Component />
      </ClientContext.Provider>
    )

    const actual = await getInitialState({
      App,
      client: client as Client
    })

    const expected = {}

    expect(actual).toEqual(expected)
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
