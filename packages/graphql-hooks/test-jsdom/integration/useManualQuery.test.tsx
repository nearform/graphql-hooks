import T from 'prop-types'
import React, { useEffect } from 'react'
import { render, screen } from '@testing-library/react'
import { GraphQLClient, ClientContext, useManualQuery } from '../../src'

const getWrapper =
  (client: GraphQLClient) =>
  ({ children }) =>
    <ClientContext.Provider value={client}>{children}</ClientContext.Provider>

describe('useManualQuery Integrations', () => {
  let testComponentRenderCount = 0
  let client
  let wrapper

  const TestComponent = ({ query = '{ hello }', options }) => {
    testComponentRenderCount++
    const [fetchData, { loading, error, data }] = useManualQuery(query, options)

    useEffect(() => {
      fetchData()
    }, [fetchData])

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

  describe('useManualQuery with nested components', () => {
    let dataNode: HTMLElement

    const ChildTestComponent = ({
      fetchData,
      loading,
      data,
      fetchDataInParentComponent
    }) => {
      // Run the query in the child's useEffect if fetchDataInParentComponent is false
      useEffect(() => {
        !fetchDataInParentComponent && fetchData()
      }, [fetchData])

      return (
        <div>
          {loading && <div data-testid="loading">Loading...</div>}
          {data && <div data-testid="data">{data}</div>}
        </div>
      )
    }
    ChildTestComponent.propTypes = {
      fetchDataInParentComponent: T.bool,
      fetchData: T.func,
      loading: T.bool,
      data: T.object
    }

    const ParentTestComponent = ({
      query = '{ hello }',
      fetchDataInParentComponent,
      options
    }) => {
      const [fetchData, { loading, data }] = useManualQuery(query, options)

      // Run the query in the parent's useEffect if fetchDataInParentComponent is true
      useEffect(() => {
        fetchDataInParentComponent && fetchData()
      }, [fetchData, fetchDataInParentComponent])

      return (
        <ChildTestComponent
          fetchData={fetchData}
          loading={loading}
          data={data}
        />
      )
    }
    ParentTestComponent.propTypes = {
      fetchDataInParentComponent: T.bool,
      options: T.object,
      query: T.string
    }

    beforeEach(() => {
      client = new GraphQLClient({ url: '/graphql' })
      client.request = jest.fn().mockResolvedValue({ data: 'data v1' })
      wrapper = getWrapper(client)
    })

    describe(`fetchData run in parent's useEffect`, () => {
      it('should reset data and loading flag if the query changes', async () => {
        const { rerender, getByTestId } = render(
          <ParentTestComponent
            query={'{ hello }'}
            // fetch data in parent component
            fetchDataInParentComponent={true}
          />,
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
      })
    })

    describe(`fetchData run in child's useEffect`, () => {
      it('should reset data and loading flag if the query changes', async () => {
        const { rerender, getByTestId } = render(
          <ParentTestComponent
            query={'{ hello }'}
            // fetch data in child component
            fetchDataInParentComponent={false}
          />,
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
      })
    })
  })
})
